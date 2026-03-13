<?php
require_once __DIR__ . "/../src/config/cors.php";
require_once __DIR__ . "/../src/middleware/require_login.php";
require_once __DIR__ . "/../src/config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

$user_id = (int) ($_SESSION["user_id"] ?? 0);
if ($user_id <= 0) {
  http_response_code(401);
  echo json_encode(["error" => "Not logged in"]);
  exit;
}

if (!isset($_FILES["photo"])) {
  http_response_code(400);
  echo json_encode(["error" => "No file uploaded"]);
  exit;
}

$file = $_FILES["photo"];

if (($file["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
  http_response_code(400);
  echo json_encode(["error" => "Upload failed"]);
  exit;
}

if (($file["size"] ?? 0) <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "Uploaded file is empty"]);
  exit;
}

$maxSizeBytes = 2 * 1024 * 1024;
if (($file["size"] ?? 0) > $maxSizeBytes) {
  http_response_code(400);
  echo json_encode(["error" => "File size exceeds 2MB limit"]);
  exit;
}

$tmpPath = $file["tmp_name"] ?? "";
if (!is_uploaded_file($tmpPath)) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid uploaded file"]);
  exit;
}

$imageInfo = @getimagesize($tmpPath);
if ($imageInfo === false) {
  http_response_code(400);
  echo json_encode(["error" => "Uploaded file is not a valid image"]);
  exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = $finfo ? finfo_file($finfo, $tmpPath) : "";
if ($finfo) {
  finfo_close($finfo);
}

$allowedMimeToExt = [
  "image/jpeg" => "jpg",
  "image/png" => "png",
];

if (!isset($allowedMimeToExt[$mimeType])) {
  http_response_code(400);
  echo json_encode(["error" => "Only JPG, JPEG, and PNG files are allowed"]);
  exit;
}

$extension = $allowedMimeToExt[$mimeType];
$relativeDir = "uploads/profile_pictures";
$absoluteDir = __DIR__ . "/" . $relativeDir;

if (!is_dir($absoluteDir) && !mkdir($absoluteDir, 0755, true)) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to create upload directory"]);
  exit;
}

$filename = sprintf("profile_%d_%d.%s", $user_id, time(), $extension);
$relativePath = $relativeDir . "/" . $filename;
$absolutePath = __DIR__ . "/" . $relativePath;

if (!move_uploaded_file($tmpPath, $absolutePath)) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to save uploaded file"]);
  exit;
}

function has_column(mysqli $conn, string $table, string $column): bool
{
  $tableEscaped = $conn->real_escape_string($table);
  $columnEscaped = $conn->real_escape_string($column);
  $query = "SHOW COLUMNS FROM `{$tableEscaped}` LIKE '{$columnEscaped}'";
  $result = $conn->query($query);
  return $result instanceof mysqli_result && $result->num_rows > 0;
}

$usersPhotoUpdated = false;
if (has_column($conn, "users", "profile_photo")) {
  $stmt = $conn->prepare("UPDATE users SET profile_photo = ? WHERE user_id = ?");
  if ($stmt) {
    $stmt->bind_param("si", $relativePath, $user_id);
    $usersPhotoUpdated = $stmt->execute();
    $stmt->close();
  }
}

$stmt = $conn->prepare("SELECT profile_id FROM profiles WHERE user_id = ? LIMIT 1");
if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare profile lookup"]);
  exit;
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$existingProfile = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($existingProfile) {
  $stmt = $conn->prepare("UPDATE profiles SET photo = ? WHERE user_id = ?");
  if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to prepare profile update"]);
    exit;
  }
  $stmt->bind_param("si", $relativePath, $user_id);
  $ok = $stmt->execute();
  $stmt->close();
} else {
  $stmt = $conn->prepare("INSERT INTO profiles (user_id, photo, availability) VALUES (?, ?, 'available')");
  if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to prepare profile insert"]);
    exit;
  }
  $stmt->bind_param("is", $user_id, $relativePath);
  $ok = $stmt->execute();
  $stmt->close();
}

if (!$ok) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to update profile photo in database"]);
  exit;
}

echo json_encode([
  "success" => true,
  "photo" => $relativePath,
  "users_profile_photo_updated" => $usersPhotoUpdated,
]);

