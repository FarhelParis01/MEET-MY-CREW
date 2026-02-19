<?php
// src/middleware/require_admin.php
session_start();

if (!isset($_SESSION["user_id"])) {
  header("Content-Type: application/json");
  http_response_code(401);
  echo json_encode(["error" => "Not logged in"]);
  exit;
}

if (!isset($_SESSION["account_type"]) || $_SESSION["account_type"] !== "admin") {
  header("Content-Type: application/json");
  http_response_code(403);
  echo json_encode(["error" => "Admin access required"]);
  exit;
}
