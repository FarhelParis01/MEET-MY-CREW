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

$project_id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
if ($project_id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "Project id is required"]);
  exit;
}

$project = null;
$members = [];
$invites = [];

$projectStmt = $conn->prepare("SELECT * FROM projects WHERE id = ? LIMIT 1");
if (!$projectStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare project query"]);
  exit;
}

$projectStmt->bind_param("i", $project_id);
$projectStmt->execute();
$projectResult = $projectStmt->get_result();
$project = $projectResult ? $projectResult->fetch_assoc() : null;
$projectStmt->close();

if (!$project) {
  http_response_code(404);
  echo json_encode(["error" => "Project not found"]);
  exit;
}

$membersStmt = $conn->prepare(
  "SELECT u.user_id, u.full_name, u.role, u.city
   FROM project_members pm
   JOIN users u ON pm.user_id = u.user_id
   WHERE pm.project_id = ?"
);
if (!$membersStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare members query"]);
  exit;
}

$membersStmt->bind_param("i", $project_id);
$membersStmt->execute();
$membersResult = $membersStmt->get_result();
while ($row = $membersResult->fetch_assoc()) {
  $members[] = $row;
}
$membersStmt->close();

$invitesStmt = $conn->prepare(
  "SELECT pi.*, u.full_name
   FROM project_invites pi
   JOIN users u ON pi.receiver_id = u.user_id
   WHERE pi.project_id = ? AND pi.status = 'pending'"
);
if (!$invitesStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare invites query"]);
  exit;
}

$invitesStmt->bind_param("i", $project_id);
$invitesStmt->execute();
$invitesResult = $invitesStmt->get_result();
while ($row = $invitesResult->fetch_assoc()) {
  $invites[] = $row;
}
$invitesStmt->close();

echo json_encode([
  "project" => $project,
  "members" => $members,
  "invites" => $invites,
]);
