<?php
require_once __DIR__ . "/../src/config/cors.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

require_once __DIR__ . "/../src/config/database.php";

// Read JSON
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);
if (!$data) $data = $_POST;

$email    = trim($data["email"] ?? "");
$password = (string)($data["password"] ?? $data["Password"] ?? "");

if ($email === "" || $password === "") {
  http_response_code(400);
  echo json_encode(["error" => "Email and password are required"]);
  exit;
}

// Fetch user
$stmt = $conn->prepare("
  SELECT user_id, full_name, email, password_hash, role, region, city, account_type, status
  FROM users
  WHERE email = ?
  LIMIT 1
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if (!$result || $result->num_rows === 0) {
  http_response_code(401);
  echo json_encode(["error" => "Invalid email or password"]);
  exit;
}

$user = $result->fetch_assoc();

// Verify hashed password
if (!password_verify($password, $user["password_hash"])) {
  http_response_code(401);
  echo json_encode(["error" => "Invalid email or password"]);
  exit;
}

// Optional: block inactive users
if (($user["status"] ?? "active") !== "active") {
  http_response_code(403);
  echo json_encode(["error" => "Account is not active"]);
  exit;
}

// Return user data (do NOT return password_hash)
unset($user["password_hash"]);

echo json_encode([
  "success" => true,
  "message" => "Login successful",
  "user" => $user
]);
