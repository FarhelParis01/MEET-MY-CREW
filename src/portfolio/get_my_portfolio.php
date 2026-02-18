<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$user_id = $_SESSION["user_id"];

$stmt = $conn->prepare("
  SELECT item_id, title, description, media_type, media_url, created_at
  FROM portfolio_items
  WHERE user_id = ?
  ORDER BY created_at DESC
");
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
  "items" => $items
]);
