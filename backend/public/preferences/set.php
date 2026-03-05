<?php
require_once __DIR__ . "/../../src/config/cors.php";
require_once __DIR__ . "/../src/auth/check_session.php";
require_once __DIR__ . "/../src/db.php";

$userId = $_SESSION["user"]["id"] ?? null;
if (!$userId) {
  http_response_code(401);
  echo json_encode(["error" => "Unauthorized"]);
  exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$mode = $input["theme_mode"] ?? "dark";
if ($mode !== "light" && $mode !== "dark") $mode = "dark";

$stmt = $pdo->prepare("UPDATE users SET theme_mode = ? WHERE id = ?");
$stmt->execute([$mode, $userId]);

echo json_encode(["success" => true, "theme_mode" => $mode]);
