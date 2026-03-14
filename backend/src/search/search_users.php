<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$rawInput = file_get_contents("php://input");
$jsonInput = json_decode($rawInput, true);
if (!is_array($jsonInput)) {
  $jsonInput = [];
}

function read_filter($key, $jsonInput) {
  if (isset($_GET[$key])) return trim((string) $_GET[$key]);
  if (isset($_POST[$key])) return trim((string) $_POST[$key]);
  if (isset($jsonInput[$key])) return trim((string) $jsonInput[$key]);
  return "";
}

function build_profile_photo_url($photoPath) {
  $photoPath = trim((string) $photoPath);
  if ($photoPath === "") {
    return null;
  }

  if (preg_match("/^https?:\/\//i", $photoPath)) {
    return $photoPath;
  }

  $normalizedPath = ltrim($photoPath, "/");
  if (strpos($normalizedPath, "uploads/") === 0) {
    return "http://localhost/meet-my-crew/backend/public/" . $normalizedPath;
  }

  return "http://localhost/meet-my-crew/backend/public/uploads/" . basename($normalizedPath);
}

$role = read_filter("role", $jsonInput);
$region = read_filter("region", $jsonInput);
$city = read_filter("city", $jsonInput);
$name = read_filter("name", $jsonInput);
$availability = read_filter("availability", $jsonInput); // available / busy / empty

$sql = "
  SELECT
    u.user_id,
    u.full_name,
    u.email,
    u.role,
    u.region,
    u.city,
    u.profile_photo,
    p.bio,
    p.skills,
    p.availability,
    p.photo
  FROM users u
  LEFT JOIN profiles p ON p.user_id = u.user_id
  WHERE u.status = 'active' AND u.account_type = 'user'
";

$params = [];
$types = "";

if ($role !== "") {
  $sql .= " AND u.role = ? ";
  $params[] = $role;
  $types .= "s";
}

if ($region !== "") {
  $sql .= " AND u.region = ? ";
  $params[] = $region;
  $types .= "s";
}

if ($city !== "") {
  $sql .= " AND u.city = ? ";
  $params[] = $city;
  $types .= "s";
}

if ($availability === "available" || $availability === "busy") {
  $sql .= " AND p.availability = ? ";
  $params[] = $availability;
  $types .= "s";
}

if ($name !== "") {
  $sql .= " AND u.full_name LIKE ? ";
  $params[] = "%" . $name . "%";
  $types .= "s";
}

$sql .= " ORDER BY u.full_name ASC LIMIT 100 ";

$stmt = $conn->prepare($sql);

if (!$stmt) {
  echo json_encode(["error" => "Failed to prepare search query"]);
  exit;
}

if ($types !== "") {
  $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$users = [];
while ($row = $result->fetch_assoc()) {
  $storedProfilePhoto = $row["profile_photo"] ?? $row["photo"] ?? "";
  $row["profile_photo_url"] = build_profile_photo_url($storedProfilePhoto);
  $users[] = $row;
}
$stmt->close();

echo json_encode([
  "count" => count($users),
  "filters" => [
    "role" => $role,
    "region" => $region,
    "city" => $city,
    "availability" => $availability,
    "name" => $name
  ],
  "users" => $users
]);
