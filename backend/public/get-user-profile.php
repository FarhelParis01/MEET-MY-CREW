<?php
require_once __DIR__ . "/../src/config/cors.php";
require_once __DIR__ . "/../src/middleware/require_login.php";
require_once __DIR__ . "/../src/config/database.php";

header("Content-Type: application/json");

$user_id = isset($_GET["user_id"]) ? (int)$_GET["user_id"] : 0;
if ($user_id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "user_id is required"]);
  exit;
}

$userStmt = $conn->prepare("SELECT user_id, full_name, email, role, region, city, account_type, status FROM users WHERE user_id = ? LIMIT 1");
if (!$userStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare user query"]);
  exit;
}

$userStmt->bind_param("i", $user_id);
$userStmt->execute();
$userResult = $userStmt->get_result();
$user = $userResult->fetch_assoc();
$userStmt->close();

if (!$user) {
  http_response_code(404);
  echo json_encode(["error" => "User not found"]);
  exit;
}

$profileStmt = $conn->prepare("SELECT bio, skills, availability, phone, photo FROM profiles WHERE user_id = ? LIMIT 1");
if (!$profileStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare profile query"]);
  exit;
}

$profileStmt->bind_param("i", $user_id);
$profileStmt->execute();
$profileResult = $profileStmt->get_result();
$profile = $profileResult->fetch_assoc();
$profileStmt->close();

echo json_encode([
  "user" => $user,
  "profile" => $profile ?: null,
]);
