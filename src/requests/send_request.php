<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$sender_id = $_SESSION["user_id"];

$data = json_decode(file_get_contents("php://input"), true);

$receiver_id = $data["receiver_id"] ?? null;
$message     = trim($data["message"] ?? "");

if (!$receiver_id || $message === "") {
  http_response_code(400);
  echo json_encode(["error" => "receiver_id and message are required"]);
  exit;
}

if ((int)$receiver_id === (int)$sender_id) {
  http_response_code(400);
  echo json_encode(["error" => "You cannot send a request to yourself"]);
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

// Insert request (status defaults to pending)
$stmt = $conn->prepare("
  INSERT INTO collaboration_requests (sender_id, receiver_id, message)
  VALUES (?, ?, ?)
");
$stmt->bind_param("iis", $sender_id, $receiver_id, $message);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to send request"]);
  $stmt->close();
  exit;
}

$request_id = $stmt->insert_id;
$stmt->close();

echo json_encode([
  "message" => "Request sent",
  "request_id" => $request_id
]);
