<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

// Read query parameters (from URL)
$role = trim($_GET["role"] ?? "");
$city = trim($_GET["city"] ?? "");
$name = trim($_GET["name"] ?? "");
$availability = trim($_GET["availability"] ?? ""); // available / busy / empty

// Build base query
$sql = "
  SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.role,
    u.region,
    u.city,
    p.bio,
    p.skills,
    p.availability,
    p.photo
  FROM users u
  LEFT JOIN profiles p ON p.user_id = u.user_id
  WHERE u.status = 'active' AND u.account_type = 'user'
";

// We'll add filters only if provided
$params = [];
$types = "";

// Filter by role
if ($role !== "") {
  $sql .= " AND u.role = ? ";
  $params[] = $role;
  $types .= "s";
}

// Filter by city
if ($city !== "") {
  $sql .= " AND u.city = ? ";
  $params[] = $city;
  $types .= "s";
}

// Filter by availability (from profiles table)
if ($availability === "available" || $availability === "busy") {
  $sql .= " AND p.availability = ? ";
  $params[] = $availability;
  $types .= "s";
}

// Search by name (partial match)
if ($name !== "") {
  $sql .= " AND u.full_name LIKE ? ";
  $params[] = "%" . $name . "%";
  $types .= "s";
}

$sql .= " ORDER BY u.full_name ASC LIMIT 50 ";

$stmt = $conn->prepare($sql);

if ($types !== "") {
  $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$users = [];
while ($row = $result->fetch_assoc()) {
  $users[] = $row;
}
$stmt->close();

echo json_encode([
  "count" => count($users),
  "filters" => [
    "role" => $role,
    "city" => $city,
    "availability" => $availability,
    "name" => $name
  ],
  "users" => $users
]);
