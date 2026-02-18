<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$user_id = $_SESSION["user_id"];

// Get user basic data
$stmt = $conn->prepare("SELECT user_id, full_name, email, role, region, city, account_type, status FROM users WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
  http_response_code(404);
  echo json_encode(["error" => "User not found"]);
  exit;
}

// Get profile details (may not exist yet)
$stmt = $conn->prepare("SELECT bio, skills, availability, phone, photo FROM profiles WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$profile = $stmt->get_result()->fetch_assoc();
$stmt->close();

echo json_encode([
  "user" => $user,
  "profile" => $profile ? $profile : null
]);
