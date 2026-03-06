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

$projects_created = [];
$projects_joined = [];

$createdStmt = $conn->prepare(
  "SELECT p.*, u.full_name AS creator_name
   FROM projects p
   JOIN users u ON u.user_id = p.creator_id
   WHERE p.creator_id = ?"
);
if (!$createdStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare created projects query"]);
  exit;
}

$createdStmt->bind_param("i", $user_id);
$createdStmt->execute();
$createdResult = $createdStmt->get_result();
while ($row = $createdResult->fetch_assoc()) {
  $projects_created[] = $row;
}
$createdStmt->close();

$joinedStmt = $conn->prepare(
  "SELECT p.*, u.full_name AS creator_name
   FROM project_members pm
   JOIN projects p ON pm.project_id = p.id
   JOIN users u ON u.user_id = p.creator_id
   WHERE pm.user_id = ?"
);
if (!$joinedStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare joined projects query"]);
  exit;
}

$joinedStmt->bind_param("i", $user_id);
$joinedStmt->execute();
$joinedResult = $joinedStmt->get_result();
while ($row = $joinedResult->fetch_assoc()) {
  $projects_joined[] = $row;
}
$joinedStmt->close();

echo json_encode([
  "projects_created" => $projects_created,
  "projects_joined" => $projects_joined,
]);
