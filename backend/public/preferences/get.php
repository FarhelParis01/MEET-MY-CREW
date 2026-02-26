<?php
require_once __DIR__ . "/../_cors.php";
require_once __DIR__ . "/../src/auth/check_session.php";
require_once __DIR__ . "/../src/db.php"; // your db connection

$userId = $_SESSION["user"]["id"] ?? null;
if (!$userId) {
  http_response_code(401);
  echo json_encode(["error" => "Unauthorized"]);
  exit;
}

$stmt = $pdo->prepare("SELECT theme_mode FROM users WHERE id = ?");
$stmt->execute([$userId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
  "theme_mode" => $row["theme_mode"] ?? "dark"
]);