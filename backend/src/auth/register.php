<?php
// src/auth/register.php
header("Content-Type: application/json");
session_start();

require_once __DIR__ . "/../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["error" => "Use POST"]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$full_name = trim($data["full_name"] ?? "");
$email     = trim($data["email"] ?? "");
$password  = $data["password"] ?? "";
$role      = trim($data["role"] ?? "");
$region    = trim($data["region"] ?? "");
$city      = trim($data["city"] ?? "");

if ($full_name === "" || $email === "" || $password === "" || $role === "") {
  http_response_code(400);
  echo json_encode(["error" => "Missing required fields"]);
  exit;
}

// check if email already exists
$stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
  http_response_code(409);
  echo json_encode(["error" => "Email already exists"]);
  $stmt->close();
  exit;
}
$stmt->close();

// hash password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// insert user
$stmt = $conn->prepare("
  INSERT INTO users (full_name, email, password_hash, role, region, city)
  VALUES (?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("ssssss", $full_name, $email, $password_hash, $role, $region, $city);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Registration failed"]);
  $stmt->close();
  exit;
}

$user_id = $stmt->insert_id;
$stmt->close();

echo json_encode([
  "message" => "Registered successfully",
  "user_id" => $user_id
]);
