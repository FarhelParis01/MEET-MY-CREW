<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$user_id = $_SESSION["user_id"];

$data = json_decode(file_get_contents("php://input"), true);

$title       = trim($data["title"] ?? "");
$description = trim($data["description"] ?? "");
$media_url   = trim($data["media_url"] ?? "");

if ($title === "" || $media_url === "") {
  http_response_code(400);
  echo json_encode(["error" => "Title and media_url are required"]);
  exit;
}

// store as link
$media_type = "link";

$stmt = $conn->prepare("
  INSERT INTO portfolio_items (user_id, title, description, media_type, media_url)
  VALUES (?, ?, ?, ?, ?)
");
$stmt->bind_param("issss", $user_id, $title, $description, $media_type, $media_url);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to add portfolio item"]);
  $stmt->close();
  exit;
}
$item_id = $stmt->insert_id;
$stmt->close();

echo json_encode([
  "message" => "Portfolio link added",
  "item_id" => $item_id
]);
