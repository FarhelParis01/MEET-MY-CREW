<?php
require_once __DIR__ . "/../src/config/cors.php";
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

require_once __DIR__ . "/../src/config/database.php";

// Read JSON body
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);
if (!$data) $data = $_POST;

$full_name = trim($data["name"] ?? $data["fullName"] ?? "");
$email     = trim($data["email"] ?? "");
$password  = (string)($data["password"] ?? "");
$role      = trim($data["role"] ?? "");
$region    = trim($data["region"] ?? "");
$city      = trim($data["city"] ?? "");

if ($full_name === "" || $email === "" || $password === "" || $role === "" || $region === "" || $city === "") {
  http_response_code(400);
  echo json_encode(["error" => "All fields are required"]);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid email"]);
  exit;
}

// Check if email already exists
$check = $conn->prepare("SELECT user_id FROM users WHERE email = ? LIMIT 1");
$check->bind_param("s", $email);
$check->execute();
$res = $check->get_result();

if ($res->num_rows > 0) {
  http_response_code(409);
  echo json_encode(["error" => "Email already exists"]);
  exit;
}

// Hash password
$hash = password_hash($password, PASSWORD_BCRYPT);

// Default values
$account_type = "user";
$status = "active";

// Insert user
$stmt = $conn->prepare("
INSERT INTO users (full_name, email, password_hash, role, region, city, account_type, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param("ssssssss", $full_name, $email, $hash, $role, $region, $city, $account_type, $status);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Registration failed"]);
  exit;
}

echo json_encode([
  "success" => true,
  "message" => "Registered successfully"
]);

exit;
