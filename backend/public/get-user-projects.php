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

$user_id = isset($_GET["user_id"]) ? (int)$_GET["user_id"] : 0;
if ($user_id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "user_id is required"]);
  exit;
}

$stmt = $conn->prepare(
  "SELECT DISTINCT
      p.id,
      p.title,
      p.project_type,
      p.location,
      p.deadline,
      p.budget,
      p.created_at
   FROM projects p
   LEFT JOIN project_members pm ON pm.project_id = p.id
   WHERE p.creator_id = ? OR pm.user_id = ?
   ORDER BY p.created_at DESC"
);

if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare projects query"]);
  exit;
}

$stmt->bind_param("ii", $user_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

$projects = [];
while ($row = $result->fetch_assoc()) {
  $projects[] = $row;
}
$stmt->close();

echo json_encode([
  "count" => count($projects),
  "projects" => $projects,
]);
