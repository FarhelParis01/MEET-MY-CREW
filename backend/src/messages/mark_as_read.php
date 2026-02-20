<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$user_id = $_SESSION["user_id"];

$data = json_decode(file_get_contents("php://input"), true);
$message_id = $data["message_id"] ?? null;

if (!$message_id) {
  http_response_code(400);
  echo json_encode(["error" => "message_id is required"]);
  exit;
}

// Only the receiver can mark a message as read
$stmt = $conn->prepare("
  UPDATE messages
  SET is_read = 1
  WHERE message_id = ? AND receiver_id = ?
");
$stmt->bind_param("ii", $message_id, $user_id);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to update message"]);
  $stmt->close();
  exit;
}

if ($stmt->affected_rows === 0) {
  http_response_code(403);
  echo json_encode(["error" => "Not allowed or message not found"]);
  $stmt->close();
  exit;
}

$stmt->close();

echo json_encode(["message" => "Message marked as read"]);
