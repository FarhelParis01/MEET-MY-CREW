<?php
require_once __DIR__ . "/../../src/config/cors.php";
require_once __DIR__ . "/../../src/middleware/require_admin.php";
require_once __DIR__ . "/../../src/config/database.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$project_id = isset($data["project_id"]) ? (int)$data["project_id"] : 0;

if ($project_id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "project_id is required"]);
  exit;
}

$stmt = $conn->prepare("DELETE FROM projects WHERE id = ?");
if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare delete"]);
  exit;
}

$stmt->bind_param("i", $project_id);
if (!$stmt->execute()) {
  $stmt->close();
  http_response_code(500);
  echo json_encode(["error" => "Failed to delete project"]);
  exit;
}

$stmt->close();
echo json_encode(["success" => true, "message" => "Project deleted"]);
