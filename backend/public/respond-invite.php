<?php
require_once __DIR__ . "/../src/config/cors.php";
define("CHECK_SESSION_ENFORCE_ONLY", true);
require_once __DIR__ . "/../src/auth/check_session.php";
require_once __DIR__ . "/../src/config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

$payload = json_decode(file_get_contents("php://input"), true);
if (!is_array($payload)) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid JSON body"]);
  exit;
}

$invite_id = isset($payload["invite_id"]) ? (int)$payload["invite_id"] : 0;
$action = strtolower(trim($payload["action"] ?? ""));
$user_id = (int)($_SESSION["user_id"] ?? 0);

if ($invite_id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "invite_id is required"]);
  exit;
}

if (!in_array($action, ["accept", "reject"], true)) {
  http_response_code(400);
  echo json_encode(["error" => "action must be accept or reject"]);
  exit;
}

$inviteStmt = $conn->prepare(
  "SELECT id, project_id, receiver_id FROM project_invites WHERE id = ? LIMIT 1"
);
if (!$inviteStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare invitation lookup"]);
  exit;
}

$inviteStmt->bind_param("i", $invite_id);
$inviteStmt->execute();
$inviteResult = $inviteStmt->get_result();
$invite = $inviteResult ? $inviteResult->fetch_assoc() : null;
$inviteStmt->close();

if (!$invite || (int)$invite["receiver_id"] !== $user_id) {
  http_response_code(403);
  echo json_encode(["error" => "Invitation not found or unauthorized"]);
  exit;
}

if ($action === "accept") {
  $conn->begin_transaction();

  try {
    $status = "accepted";
    $updateStmt = $conn->prepare("UPDATE project_invites SET status = ? WHERE id = ?");
    if (!$updateStmt) {
      throw new Exception("Failed to prepare invitation update");
    }
    $updateStmt->bind_param("si", $status, $invite_id);
    if (!$updateStmt->execute()) {
      $updateStmt->close();
      throw new Exception("Failed to update invitation status");
    }
    $updateStmt->close();

    $project_id = (int)$invite["project_id"];
    $memberStmt = $conn->prepare(
      "INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)"
    );
    if (!$memberStmt) {
      throw new Exception("Failed to prepare member insert");
    }
    $memberStmt->bind_param("ii", $project_id, $user_id);
    if (!$memberStmt->execute()) {
      $memberStmt->close();
      throw new Exception("Failed to add member to project");
    }
    $memberStmt->close();

    $conn->commit();

    echo json_encode([
      "success" => true,
      "message" => "Invitation accepted"
    ]);
    exit;
  } catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => "Failed to process invitation"]);
    exit;
  }
}

$status = "rejected";
$rejectStmt = $conn->prepare("UPDATE project_invites SET status = ? WHERE id = ?");
if (!$rejectStmt) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to prepare invitation update"]);
  exit;
}

$rejectStmt->bind_param("si", $status, $invite_id);
if (!$rejectStmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to reject invitation"]);
  $rejectStmt->close();
  exit;
}
$rejectStmt->close();

echo json_encode([
  "success" => true,
  "message" => "Invitation rejected"
]);
