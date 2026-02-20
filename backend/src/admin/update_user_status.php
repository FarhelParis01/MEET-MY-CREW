<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_admin.php";
require_once __DIR__ . "/../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data["user_id"] ?? null;
$status  = trim($data["status"] ?? ""); // active or suspended

if (!$user_id || ($status !== "active" && $status !== "suspended")) {
  http_response_code(400);
  echo json_encode(["error" => "user_id and status (active/suspended) required"]);
  exit;
}

$stmt = $conn->prepare("UPDATE users SET status = ? WHERE user_id = ?");
$stmt->bind_param("si", $status, $user_id);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to update status"]);
  $stmt->close();
  exit;
}

$stmt->close();

echo json_encode(["message" => "User status updated", "status" => $status]);
