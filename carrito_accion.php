<?php
require_once 'includes/functions.php';
requireLogin();

$accion = $_POST['accion'] ?? '';
$productoId = (int) ($_POST['producto_id'] ?? 0);
$cantidad = max(1, (int) ($_POST['cantidad'] ?? 1));

$prod = $pdo->prepare('SELECT id, stock, precio FROM productos WHERE id = ? AND estado = 1');
$prod->execute([$productoId]);
$producto = $prod->fetch();
if (!$producto) {
    $_SESSION['flash'] = ['type' => 'error', 'message' => 'Producto no disponible.'];
    redirect('catalogo.php');
}

if (in_array($accion, ['agregar', 'actualizar'], true) && ((int) $producto['stock'] <= 0 || (float) $producto['precio'] <= 0)) {
    $_SESSION['flash'] = ['type' => 'warning', 'message' => 'Consulta el precio y la disponibilidad de este modelo.'];
    redirect('producto.php?id=' . $productoId);
}

if ($accion === 'agregar') {
    $cantidad = min($cantidad, (int) $producto['stock']);
    $stmt = $pdo->prepare('INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cantidad = LEAST(cantidad + VALUES(cantidad), ?)');
    $stmt->execute([$_SESSION['usuario_id'], $productoId, $cantidad, (int) $producto['stock']]);
    $_SESSION['flash'] = ['type' => 'success', 'message' => 'Producto agregado al carrito.'];
} elseif ($accion === 'actualizar') {
    $cantidad = min($cantidad, (int) $producto['stock']);
    $stmt = $pdo->prepare('UPDATE carrito SET cantidad = ? WHERE usuario_id = ? AND producto_id = ?');
    $stmt->execute([$cantidad, $_SESSION['usuario_id'], $productoId]);
    $_SESSION['flash'] = ['type' => 'success', 'message' => 'Cantidad actualizada.'];
} elseif ($accion === 'eliminar') {
    $stmt = $pdo->prepare('DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ?');
    $stmt->execute([$_SESSION['usuario_id'], $productoId]);
    $_SESSION['flash'] = ['type' => 'info', 'message' => 'Producto eliminado del carrito.'];
}

redirect('carrito.php');
?>
