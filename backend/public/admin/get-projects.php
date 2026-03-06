<?php
require_once __DIR__ . "/../../src/config/cors.php";
require_once __DIR__ . "/../../src/middleware/require_admin.php";
require_once __DIR__ . "/../../src/config/database.php";

header("Content-Type: application/json");

$sql = "
  SELECT
    p.id,
    p.title,
    p.project_type,
    COALESCE(u.full_name, 'Unknown') AS creator_name,
    COUNT(pm.user_id) AS members_count
  FROM projects p
  LEFT JOIN users u ON p.creator_id = u.user_id
  LEFT JOIN project_members pm ON pm.project_id = p.id
  GROUP BY p.id, p.title, p.project_type, u.full_name
  ORDER BY p.id DESC
";

$result = $conn->query($sql);
if (!$result) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to fetch projects"]);
  exit;
}

$projects = [];
while ($row = $result->fetch_assoc()) {
  $projects[] = $row;
}

echo json_encode(["projects" => $projects]);
