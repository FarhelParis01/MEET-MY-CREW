<?php
require_once __DIR__ . "/../../src/config/cors.php";
require_once __DIR__ . "/../../src/middleware/require_admin.php";
require_once __DIR__ . "/../../src/config/database.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$item_id = isset($data["item_id"]) ? (int)$data["item_id"] : 0;

if ($item_id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "item_id is required"]);
  exit;
}

$stmt = $conn->prepare("DELETE FROM portfolio_items WHERE item_id = ?");
if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare delete"]);
  exit;
}

$stmt->bind_param("i", $item_id);
if (!$stmt->execute()) {
  $stmt->close();
  http_response_code(500);
  echo json_encode(["error" => "Failed to delete portfolio item"]);
  exit;
}

if ($stmt->affected_rows === 0) {
  $stmt->close();
  http_response_code(404);
  echo json_encode(["error" => "Portfolio item not found"]);
  exit;
}

$stmt->close();

echo json_encode([
  "success" => true,
  "message" => "Portfolio item deleted",
]);
