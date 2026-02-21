<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  exit; // stop preflight
}

require_once __DIR__ . "/../src/auth/login.php";
