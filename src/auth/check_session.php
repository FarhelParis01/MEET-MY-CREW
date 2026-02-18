<?php
// src/auth/check_session.php
header("Content-Type: application/json");
session_start();

if (!isset($_SESSION["user_id"])) {
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
