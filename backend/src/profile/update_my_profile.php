<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$user_id = $_SESSION["user_id"];

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
  $data = [];
}

$bio          = trim($data["bio"] ?? "");
$skills       = trim($data["skills"] ?? "");
$availability = trim($data["availability"] ?? "available"); // available or busy
$phone        = trim($data["phone"] ?? "");

if ($availability !== "available" && $availability !== "busy") {
  http_response_code(400);
  echo json_encode(["error" => "Invalid availability value"]);
  exit;
}

// Check if profile exists
$stmt = $conn->prepare("SELECT profile_id FROM profiles WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($res) {
  // Update existing profile
  $stmt = $conn->prepare("
    UPDATE profiles
    SET bio = ?, skills = ?, availability = ?, phone = ?
    WHERE user_id = ?
  ");
  $stmt->bind_param("ssssi", $bio, $skills, $availability, $phone, $user_id);
  $ok = $stmt->execute();
  $stmt->close();
} else {
  // Create profile if missing
  $stmt = $conn->prepare("
    INSERT INTO profiles (user_id, bio, skills, availability, phone)
    VALUES (?, ?, ?, ?, ?)
  ");
  $stmt->bind_param("issss", $user_id, $bio, $skills, $availability, $phone);
  $ok = $stmt->execute();
  $stmt->close();
}

if (!$ok) {
  http_response_code(500);
  echo json_encode(["error" => "Profile update failed"]);
  exit;
}

echo json_encode([
  "success" => true,
  "message" => "Profile updated successfully",
]);
