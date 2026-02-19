<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$sender_id = $_SESSION["user_id"];

$data = json_decode(file_get_contents("php://input"), true);

$receiver_id  = $data["receiver_id"] ?? null;
$message_text = trim($data["message_text"] ?? "");

if (!$receiver_id || $message_text === "") {
  http_response_code(400);
  echo json_encode(["error" => "receiver_id and message_text are required"]);
  exit;
}

if ((int)$receiver_id === (int)$sender_id) {
  http_response_code(400);
  echo json_encode(["error" => "You cannot message yourself"]);
  exit;
}

// Check receiver exists and is active
$stmt = $conn->prepare("SELECT user_id, status FROM users WHERE user_id = ?");
$stmt->bind_param("i", $receiver_id);
$stmt->execute();
$receiver = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$receiver) {
  http_response_code(404);
  echo json_encode(["error" => "Receiver not found"]);
  exit;
}

if ($receiver["status"] !== "active") {
  http_response_code(403);
  echo json_encode(["error" => "Receiver account is not active"]);
  exit;
}

// Insert message
$stmt = $conn->prepare("
  INSERT INTO messages (sender_id, receiver_id, message_text)
  VALUES (?, ?, ?)
");
$stmt->bind_param("iis", $sender_id, $receiver_id, $message_text);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to send message"]);
  $stmt->close();
  exit;
}

$message_id = $stmt->insert_id;
$stmt->close();

echo json_encode([
  "message" => "Message sent",
  "message_id" => $message_id
]);
