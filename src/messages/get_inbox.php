<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$user_id = $_SESSION["user_id"];

// Get messages where logged-in user is the receiver
$stmt = $conn->prepare("
  SELECT 
    m.message_id,
    m.sender_id,
    u.full_name AS sender_name,
    m.message_text,
    m.sent_at,
    m.is_read
  FROM messages m
  JOIN users u ON u.user_id = m.sender_id
  WHERE m.receiver_id = ?
  ORDER BY m.sent_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();
$messages = [];

while ($row = $result->fetch_assoc()) {
  $messages[] = $row;
}

$stmt->close();

echo json_encode([
  "count" => count($messages),
  "messages" => $messages
]);
