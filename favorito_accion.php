<?php
require_once 'includes/functions.php';
requireLogin();

$productoId = (int) ($_POST['producto_id'] ?? 0);
$stmt = $pdo->prepare('SELECT id FROM favoritos WHERE usuario_id = ? AND producto_id = ?');
$stmt->execute([$_SESSION['usuario_id'], $productoId]);

if ($stmt->fetch()) {
    $del = $pdo->prepare('DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?');
    $del->execute([$_SESSION['usuario_id'], $productoId]);
    $_SESSION['flash'] = ['type' => 'info', 'message' => 'Producto eliminado de favoritos.'];
} else {
    $ins = $pdo->prepare('INSERT INTO favoritos (usuario_id, producto_id) VALUES (?, ?)');
    $ins->execute([$_SESSION['usuario_id'], $productoId]);
    $_SESSION['flash'] = ['type' => 'success', 'message' => 'Producto agregado a favoritos.'];
}

redirect($_SERVER['HTTP_REFERER'] ?? 'favoritos.php');
?>
