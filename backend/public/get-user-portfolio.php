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
  "SELECT
      item_id,
      title,
      description,
      media_url AS video_link,
      created_at
   FROM portfolio_items
   WHERE user_id = ?
   ORDER BY created_at DESC"
);

if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare portfolio query"]);
  exit;
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
  $items[] = $row;
}
$stmt->close();

echo json_encode([
  "count" => count($items),
  "items" => $items,
]);
