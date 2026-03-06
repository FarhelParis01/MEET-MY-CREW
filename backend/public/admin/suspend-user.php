<?php
require_once __DIR__ . "/../../src/config/cors.php";
require_once __DIR__ . "/../../src/middleware/require_admin.php";
require_once __DIR__ . "/../../src/config/database.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$user_id = isset($data["user_id"]) ? (int)$data["user_id"] : 0;

if ($user_id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "user_id is required"]);
  exit;
}

$stmt = $conn->prepare("UPDATE users SET status = 'suspended' WHERE user_id = ?");
if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare update"]);
  exit;
}

$stmt->bind_param("i", $user_id);
if (!$stmt->execute()) {
  $stmt->close();
  http_response_code(500);
  echo json_encode(["error" => "Failed to suspend user"]);
  exit;
}

$stmt->close();
echo json_encode(["success" => true, "message" => "User suspended"]);
