<?php
// src/auth/login.php
header("Content-Type: application/json");
session_start();

require_once __DIR__ . "/../config/database.php";

<h1 className="text-red-500 text-3xl font-bold">Tailwind Test</h1>

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["error" => "Use POST"]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$email    = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
  http_response_code(400);
  echo json_encode(["error" => "Email and password required"]);
  exit;
}

$stmt = $conn->prepare("SELECT user_id, full_name, password_hash, account_type, status FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
  http_response_code(401);
  echo json_encode(["error" => "Invalid login"]);
  exit;
}

if ($user["status"] !== "active") {
  http_response_code(403);
  echo json_encode(["error" => "Account suspended"]);
  exit;
}

if (!password_verify($password, $user["password_hash"])) {
  http_response_code(401);
  echo json_encode(["error" => "Invalid login"]);
  exit;
}

// ✅ create session
$_SESSION["user_id"] = $user["user_id"];
$_SESSION["full_name"] = $user["full_name"];
$_SESSION["account_type"] = $user["account_type"];

echo json_encode([
  "message" => "Login successful",
  "user" => [
    "user_id" => $user["user_id"],
    "full_name" => $user["full_name"],
    "account_type" => $user["account_type"]
  ]
]);
