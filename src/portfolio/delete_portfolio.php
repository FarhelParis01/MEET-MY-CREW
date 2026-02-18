<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$user_id = $_SESSION["user_id"];

$data = json_decode(file_get_contents("php://input"), true);
$item_id = $data["item_id"] ?? null;

if (!$item_id) {
  http_response_code(400);
  echo json_encode(["error" => "Item ID required"]);
  exit;
}

// Make sure the item belongs to the logged-in user
$stmt = $conn->prepare("
  DELETE FROM portfolio_items
  WHERE item_id = ? AND user_id = ?
");
$stmt->bind_param("ii", $item_id, $user_id);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Delete failed"]);
  $stmt->close();
  exit;
}

if ($stmt->affected_rows === 0) {
  http_response_code(403);
  echo json_encode(["error" => "Not allowed or item not found"]);
  $stmt->close();
  exit;
}

$stmt->close();

echo json_encode(["message" => "Portfolio item deleted"]);
