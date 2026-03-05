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

$payload = json_decode(file_get_contents("php://input"), true);
if (!is_array($payload)) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid JSON body"]);
  exit;
}

$project_id = isset($payload["project_id"]) ? (int)$payload["project_id"] : 0;
$receiver_id = isset($payload["receiver_id"]) ? (int)$payload["receiver_id"] : 0;
$message = trim($payload["message"] ?? "");
$sender_id = (int)($_SESSION["user_id"] ?? 0);

if ($project_id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "project_id is required"]);
  exit;
}

if ($receiver_id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "receiver_id is required"]);
  exit;
}

if ($sender_id <= 0) {
  http_response_code(401);
  echo json_encode(["error" => "Not logged in"]);
  exit;
}

if ($receiver_id === $sender_id) {
  http_response_code(400);
  echo json_encode(["error" => "You cannot invite yourself"]);
  exit;
}

// Ensure the logged-in user owns the project before inviting anyone.
$ownerStmt = $conn->prepare("SELECT creator_id FROM projects WHERE id = ? LIMIT 1");
if (!$ownerStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare ownership check"]);
  exit;
}

$ownerStmt->bind_param("i", $project_id);
$ownerStmt->execute();
$ownerResult = $ownerStmt->get_result();
$project = $ownerResult ? $ownerResult->fetch_assoc() : null;
$ownerStmt->close();

if (!$project) {
  http_response_code(404);
  echo json_encode(["error" => "Project not found"]);
  exit;
}

if ((int)$project["creator_id"] !== $sender_id) {
  http_response_code(403);
  echo json_encode(["error" => "Not authorized to invite users"]);
  exit;
}

$status = "pending";
$insertStmt = $conn->prepare(
  "INSERT INTO project_invites (project_id, sender_id, receiver_id, message, status) VALUES (?, ?, ?, ?, ?)"
);

if (!$insertStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare invite insert"]);
  exit;
}

$insertStmt->bind_param("iiiss", $project_id, $sender_id, $receiver_id, $message, $status);

if (!$insertStmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to send invitation"]);
  $insertStmt->close();
  exit;
}

$insertStmt->close();

echo json_encode([
  "success" => true,
  "message" => "Invitation sent"
]);
