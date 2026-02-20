<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$user_id = $_SESSION["user_id"];

// Get requests sent to the logged-in user
$stmt = $conn->prepare("
  SELECT
    r.request_id,
    r.sender_id,
    u.full_name AS sender_name,
    r.message,
    r.status,
    r.created_at
  FROM collaboration_requests r
  JOIN users u ON u.user_id = r.sender_id
  WHERE r.receiver_id = ?
  ORDER BY r.created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();
$requests = [];

while ($row = $result->fetch_assoc()) {
  $requests[] = $row;
}

$stmt->close();

echo json_encode([
  "count" => count($requests),
  "requests" => $requests
]);
