<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_admin.php";
require_once __DIR__ . "/../config/database.php";

$stmt = $conn->prepare("
  SELECT user_id, full_name, email, role, region, city, account_type, status, created_at
  FROM users
  ORDER BY created_at DESC
  LIMIT 100
");
$stmt->execute();

$result = $stmt->get_result();
$users = [];

while ($row = $result->fetch_assoc()) {
  $users[] = $row;
}

$stmt->close();

echo json_encode([
  "count" => count($users),
  "users" => $users
]);
