<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../src/config/database.php";

$result = $conn->query("SELECT 'API Working ✅' AS message");
$row = $result->fetch_assoc();

echo json_encode([
  "status" => "success",
  "data" => $row
]);


