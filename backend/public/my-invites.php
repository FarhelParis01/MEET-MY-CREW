<?php
require_once __DIR__ . "/../src/config/cors.php";
define("CHECK_SESSION_ENFORCE_ONLY", true);
require_once __DIR__ . "/../src/auth/check_session.php";
require_once __DIR__ . "/../src/config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

$user_id = (int)($_SESSION["user_id"] ?? 0);
if ($user_id <= 0) {
  http_response_code(401);
  echo json_encode(["error" => "Not logged in"]);
  exit;
}

$invites = [];

$stmt = $conn->prepare(
  "SELECT pi.*, p.title
   FROM project_invites pi
   JOIN projects p ON pi.project_id = p.id
   WHERE pi.receiver_id = ? AND pi.status = 'pending'"
);

if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare invites query"]);
  exit;
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
  $invites[] = $row;
}

$stmt->close();

echo json_encode($invites);
