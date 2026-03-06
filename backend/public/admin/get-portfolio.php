<?php
require_once __DIR__ . "/../../src/config/cors.php";
require_once __DIR__ . "/../../src/middleware/require_admin.php";
require_once __DIR__ . "/../../src/config/database.php";

header("Content-Type: application/json");

$sql = "
  SELECT
    pi.item_id,
    pi.title,
    pi.description,
    pi.media_url AS video_link,
    pi.created_at,
    COALESCE(u.full_name, 'Unknown') AS creator_name
  FROM portfolio_items pi
  LEFT JOIN users u ON u.user_id = pi.user_id
  ORDER BY pi.created_at DESC
";

$result = $conn->query($sql);
if (!$result) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to fetch portfolio items"]);
  exit;
}

$items = [];
while ($row = $result->fetch_assoc()) {
  $items[] = $row;
}

echo json_encode([
  "items" => $items,
  "count" => count($items),
]);
