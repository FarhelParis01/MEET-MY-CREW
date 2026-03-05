<?php
require_once __DIR__ . "/../src/config/cors.php";
define("CHECK_SESSION_ENFORCE_ONLY", true);
require_once __DIR__ . "/../src/auth/check_session.php";
require_once __DIR__ . "/../src/config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

$sender_id = (int)($_SESSION["user_id"] ?? 0);
if ($sender_id <= 0) {
  http_response_code(401);
  echo json_encode(["error" => "Not logged in"]);
  exit;
}

$payload = json_decode(file_get_contents("php://input"), true);
if (!is_array($payload)) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid JSON body"]);
  exit;
}

$project_id = isset($payload["project_id"]) ? (int)$payload["project_id"] : 0;
$message = trim($payload["message"] ?? "");

if ($project_id <= 0 || $message === "") {
  http_response_code(400);
  echo json_encode(["error" => "project_id and message are required"]);
  exit;
}

$stmt = $conn->prepare(
  "INSERT INTO project_messages (project_id, sender_id, message) VALUES (?, ?, ?)"
);

if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare message insert"]);
  exit;
}

$stmt->bind_param("iis", $project_id, $sender_id, $message);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to send project message"]);
  $stmt->close();
  exit;
}

$message_id = $stmt->insert_id;
$stmt->close();

echo json_encode([
  "success" => true,
  "message_id" => $message_id,
]);
