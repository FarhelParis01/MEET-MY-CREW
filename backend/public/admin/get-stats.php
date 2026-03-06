<?php
require_once __DIR__ . "/../../src/config/cors.php";
require_once __DIR__ . "/../../src/middleware/require_admin.php";
require_once __DIR__ . "/../../src/config/database.php";

header("Content-Type: application/json");

function count_from_table($conn, $table) {
  $safeTable = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
  if ($safeTable === "") return 0;

  $stmt = $conn->prepare("SELECT COUNT(*) AS total FROM `{$safeTable}`");
  if (!$stmt) {
    return 0;
  }

  if (!$stmt->execute()) {
    $stmt->close();
    return 0;
  }

  $result = $stmt->get_result();
  $row = $result ? $result->fetch_assoc() : null;
  $stmt->close();

  return (int)($row["total"] ?? 0);
}

function grouped_counts($conn, $table, $column, $allowedKeys = null) {
  $safeTable = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
  $safeColumn = preg_replace('/[^a-zA-Z0-9_]/', '', $column);

  if ($safeTable === "" || $safeColumn === "") {
    return $allowedKeys ? array_fill_keys($allowedKeys, 0) : [];
  }

  $stmt = $conn->prepare("SELECT {$safeColumn} AS label, COUNT(*) AS total FROM `{$safeTable}` GROUP BY {$safeColumn}");
  if (!$stmt) {
    return $allowedKeys ? array_fill_keys($allowedKeys, 0) : [];
  }

  if (!$stmt->execute()) {
    $stmt->close();
    return $allowedKeys ? array_fill_keys($allowedKeys, 0) : [];
  }

  $result = $stmt->get_result();
  $out = [];

  if ($result) {
    while ($row = $result->fetch_assoc()) {
      $label = trim((string)($row["label"] ?? ""));
      if ($label === "") $label = "unknown";
      $out[strtolower($label)] = (int)($row["total"] ?? 0);
    }
  }

  $stmt->close();

  if ($allowedKeys) {
    $normalized = array_fill_keys($allowedKeys, 0);
    foreach ($normalized as $key => $_) {
      if (isset($out[$key])) $normalized[$key] = $out[$key];
    }
    return $normalized;
  }

  return $out;
}

$total_users = count_from_table($conn, "users");
$total_projects = count_from_table($conn, "projects");
$total_portfolio_items = count_from_table($conn, "portfolio_items");
$direct_messages = count_from_table($conn, "messages");
$project_messages = count_from_table($conn, "project_messages");
$total_messages = $direct_messages + $project_messages;

$user_status = grouped_counts($conn, "users", "status", ["active", "suspended"]);
$account_types = grouped_counts($conn, "users", "account_type", ["user", "admin"]);
$project_types = grouped_counts($conn, "projects", "project_type");

echo json_encode([
  "total_users" => $total_users,
  "total_projects" => $total_projects,
  "total_portfolio_items" => $total_portfolio_items,
  "total_messages" => $total_messages,
  "direct_messages" => $direct_messages,
  "project_messages" => $project_messages,
  "user_status_breakdown" => $user_status,
  "account_type_breakdown" => $account_types,
  "project_type_breakdown" => $project_types,
]);
