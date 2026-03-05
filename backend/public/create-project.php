<?php
require_once __DIR__ . "/../src/config/cors.php";

// Verify user session using existing check_session flow.
ob_start();
require_once __DIR__ . "/../src/auth/check_session.php";
ob_end_clean();

require_once __DIR__ . "/../src/config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid JSON body"]);
  exit;
}

$title = trim($data["title"] ?? "");
$description = trim($data["description"] ?? "");
$project_type = trim($data["project_type"] ?? "");
$location = trim($data["location"] ?? "");
$deadline = trim($data["deadline"] ?? "");
$budget = $data["budget"] ?? "";

if ($title === "") {
  http_response_code(400);
  echo json_encode(["error" => "Project title is required"]);
  exit;
}

$creator_id = $_SESSION["user_id"] ?? null;
if (!$creator_id) {
  http_response_code(401);
  echo json_encode(["error" => "Not logged in"]);
  exit;
}

$stmt = $conn->prepare(
  "INSERT INTO projects (creator_id, title, description, project_type, location, deadline, budget)
   VALUES (?, ?, ?, ?, ?, ?, NULLIF(?, ''))"
);

if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare statement"]);
  exit;
}

$budgetText = is_numeric($budget) ? (string)$budget : "";
$stmt->bind_param(
  "issssss",
  $creator_id,
  $title,
  $description,
  $project_type,
  $location,
  $deadline,
  $budgetText
);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to create project"]);
  $stmt->close();
  exit;
}

$project_id = $stmt->insert_id;
$stmt->close();

echo json_encode([
  "success" => true,
  "project_id" => $project_id,
]);
