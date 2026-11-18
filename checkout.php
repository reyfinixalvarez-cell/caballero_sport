<?php
$pageTitle = 'Finalizar compra';
require_once 'includes/header.php';
requireLogin();
$user = currentUser();

$stmt = $pdo->prepare('SELECT ca.cantidad, p.* FROM carrito ca INNER JOIN productos p ON p.id = ca.producto_id WHERE ca.usuario_id = ?');
$stmt->execute([$_SESSION['usuario_id']]);
$items = $stmt->fetchAll();
if (!$items) {
    $_SESSION['flash'] = ['type' => 'warning', 'message' => 'Tu carrito esta vacio.'];
    redirect('carrito.php');
}

$total = 0;
foreach ($items as $item) {
    $total += ($item['precio_oferta'] ?: $item['precio']) * $item['cantidad'];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $direccion = trim($_POST['direccion'] ?? '');
    if ($direccion === '') {
        $_SESSION['flash'] = ['type' => 'error', 'message' => 'Ingresa una direccion de envio.'];
    } else {
        try {
            // La transaccion evita pedidos incompletos si falla el stock o el detalle.
            $pdo->beginTransaction();
            foreach ($items as $item) {
                if ($item['cantidad'] > $item['stock']) {
                    throw new Exception('Stock insuficiente para ' . $item['nombre']);
                }
            }
            $pedido = $pdo->prepare('INSERT INTO pedidos (usuario_id, total, direccion_envio) VALUES (?, ?, ?)');
            $pedido->execute([$_SESSION['usuario_id'], $total, $direccion]);
            $pedidoId = $pdo->lastInsertId();

            $detalle = $pdo->prepare('INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)');
            $stock = $pdo->prepare('UPDATE productos SET stock = stock - ? WHERE id = ?');
            foreach ($items as $item) {
                $precio = $item['precio_oferta'] ?: $item['precio'];
                $subtotal = $precio * $item['cantidad'];
                $detalle->execute([$pedidoId, $item['id'], $item['cantidad'], $precio, $subtotal]);
                $stock->execute([$item['cantidad'], $item['id']]);
            }
            $limpiar = $pdo->prepare('DELETE FROM carrito WHERE usuario_id = ?');
            $limpiar->execute([$_SESSION['usuario_id']]);
            $pdo->commit();
            $_SESSION['flash'] = ['type' => 'success', 'message' => 'Compra simulada realizada correctamente.'];
            redirect('pedidos.php');
        } catch (Exception $e) {
            $pdo->rollBack();
            $_SESSION['flash'] = ['type' => 'error', 'message' => $e->getMessage()];
        }
    }
}
?>
<section class="container py-5">
    <div class="row g-4 justify-content-center">
        <div class="col-lg-7">
            <div class="content-panel">
                <h1>Finalizar compra</h1>
                <form method="post">
                    <div class="mb-3">
                        <label class="form-label">Direccion de envio</label>
                        <input type="text" name="direccion" class="form-control" value="<?= e($user['direccion']) ?>" required>
                    </div>
                    <div class="alert alert-info">Esta es una compra simulada para el proyecto. No se procesa pago real.</div>
                    <button class="btn btn-primary" type="submit">Confirmar pedido por Bs <?= number_format($total, 2) ?></button>
                </form>
            </div>
        </div>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
