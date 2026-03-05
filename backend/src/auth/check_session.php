<?php
// src/auth/check_session.php
header("Content-Type: application/json");
if (session_status() !== PHP_SESSION_ACTIVE) {
  session_start();
}

$logged_in = isset($_SESSION["user_id"]);

if (defined("CHECK_SESSION_ENFORCE_ONLY") && CHECK_SESSION_ENFORCE_ONLY === true) {
  if (!$logged_in) {
    http_response_code(401);
    echo json_encode([
      "logged_in" => false,
      "message" => "Not logged in"
    ]);
    exit;
  }
  return;
}

if (!$logged_in) {
  http_response_code(401);
  echo json_encode([
    "logged_in" => false,
    "message" => "Not logged in"
  ]);
  exit;
}

echo json_encode([
  "logged_in" => true,
  "user" => [
    "user_id" => $_SESSION["user_id"],
    "full_name" => $_SESSION["full_name"],
    "account_type" => $_SESSION["account_type"]
  ]
]);
