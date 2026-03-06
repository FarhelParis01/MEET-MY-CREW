<?php
require_once __DIR__ . "/../src/config/cors.php";
define("CHECK_SESSION_ENFORCE_ONLY", true);
require_once __DIR__ . "/../src/auth/check_session.php";
require_once __DIR__ . "/../src/config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

$user_id = (int)($_SESSION["user_id"] ?? 0);
if ($user_id <= 0) {
  http_response_code(401);
  echo json_encode(["error" => "Not logged in"]);
  exit;
}

$target_user_id = isset($_GET["user_id"]) ? (int)$_GET["user_id"] : 0;

if ($target_user_id > 0) {
  $stmt = $conn->prepare(
    "SELECT
      m.message_id,
      m.sender_id,
      s.full_name AS sender_name,
      m.receiver_id,
      r.full_name AS receiver_name,
      m.message_text,
      m.sent_at,
      m.is_read
    FROM messages m
    JOIN users s ON s.user_id = m.sender_id
    JOIN users r ON r.user_id = m.receiver_id
    WHERE (m.sender_id = ? AND m.receiver_id = ?)
       OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.sent_at ASC"
  );

  if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to prepare messages query"]);
    exit;
  }

  $stmt->bind_param("iiii", $user_id, $target_user_id, $target_user_id, $user_id);
} else {
  $stmt = $conn->prepare(
    "SELECT
      m.message_id,
      m.sender_id,
      s.full_name AS sender_name,
      m.receiver_id,
      r.full_name AS receiver_name,
      m.message_text,
      m.sent_at,
      m.is_read
    FROM messages m
    JOIN users s ON s.user_id = m.sender_id
    JOIN users r ON r.user_id = m.receiver_id
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY m.sent_at DESC
    LIMIT 300"
  );

  if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to prepare inbox query"]);
    exit;
  }

  $stmt->bind_param("ii", $user_id, $user_id);
}

$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
  $messages[] = $row;
}
$stmt->close();

echo json_encode([
  "messages" => $messages,
  "count" => count($messages),
]);
