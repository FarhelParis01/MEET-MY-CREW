<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/require_login.php";
require_once __DIR__ . "/../config/database.php";

$user_id = $_SESSION["user_id"];

$data = json_decode(file_get_contents("php://input"), true);

$request_id = $data["request_id"] ?? null;
$action     = trim($data["action"] ?? ""); // "accepted" or "declined"

if (!$request_id || ($action !== "accepted" && $action !== "declined")) {
  http_response_code(400);
  echo json_encode(["error" => "request_id and action (accepted/declined) are required"]);
  exit;
}

// Only receiver can respond
$stmt = $conn->prepare("
  UPDATE collaboration_requests
  SET status = ?
  WHERE request_id = ? AND receiver_id = ? AND status = 'pending'
");
$stmt->bind_param("sii", $action, $request_id, $user_id);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to respond"]);
  $stmt->close();
  exit;
}

if ($stmt->affected_rows === 0) {
  http_response_code(403);
  echo json_encode(["error" => "Not allowed, request not found, or already responded"]);
  $stmt->close();
  exit;
}

$stmt->close();

echo json_encode(["message" => "Request " . $action]);
