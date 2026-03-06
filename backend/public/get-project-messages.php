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

$project_id = isset($_GET["project_id"]) ? (int)$_GET["project_id"] : 0;
if ($project_id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "project_id is required"]);
  exit;
}

$stmt = $conn->prepare(
  "SELECT
    pm.id,
    pm.project_id,
    pm.sender_id,
    u.full_name AS sender,
    pm.message,
    pm.created_at
   FROM project_messages pm
   JOIN users u ON pm.sender_id = u.user_id
   WHERE pm.project_id = ?
   ORDER BY pm.created_at ASC"
);

if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare project messages query"]);
  exit;
}

$stmt->bind_param("i", $project_id);
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
