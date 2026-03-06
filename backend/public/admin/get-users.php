<?php
require_once __DIR__ . "/../../src/config/cors.php";
require_once __DIR__ . "/../../src/middleware/require_admin.php";
require_once __DIR__ . "/../../src/config/database.php";

header("Content-Type: application/json");

$stmt = $conn->prepare("SELECT user_id, full_name, role, city, account_type, status FROM users ORDER BY user_id DESC");
if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare query"]);
  exit;
}

$stmt->execute();
$result = $stmt->get_result();
$users = [];

while ($row = $result->fetch_assoc()) {
  $users[] = $row;
}

$stmt->close();

echo json_encode(["users" => $users]);
