<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../src/config/database.php";

$result = $conn->query("SELECT 'API Working ✅' AS message");
$row = $result->fetch_assoc();

echo json_encode([
  "status" => "success",
  "data" => $row
]);


npm create vite@latest meet-my-crew-frontend -- --template react
cd meet-my-crew-frontend
npm install
npm run dev