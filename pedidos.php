<?php
$pageTitle = 'Mis pedidos';
require_once 'includes/header.php';
requireLogin();

$stmt = $pdo->prepare('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY creado_en DESC');
$stmt->execute([$_SESSION['usuario_id']]);
$pedidos = $stmt->fetchAll();
?>
<section class="page-heading">
    <div class="container">
        <span class="section-kicker">Historial</span>
        <h1>Mis pedidos</h1>
    </div>
</section>
<section class="container py-5">
    <?php if (!$pedidos): ?>
        <div class="empty-state">Aun no tienes pedidos.</div>
    <?php endif; ?>
    <div class="accordion" id="orders">
        <?php foreach ($pedidos as $pedido): ?>
            <?php
            $det = $pdo->prepare('SELECT d.*, p.nombre, p.marca FROM detalle_pedidos d INNER JOIN productos p ON p.id = d.producto_id WHERE d.pedido_id = ?');
            $det->execute([$pedido['id']]);
            $detalle = $det->fetchAll();
            ?>
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#pedido<?= (int) $pedido['id'] ?>">
                        Pedido #<?= (int) $pedido['id'] ?> · <?= e($pedido['estado']) ?> · Bs <?= number_format($pedido['total'], 2) ?>
                    </button>
                </h2>
                <div id="pedido<?= (int) $pedido['id'] ?>" class="accordion-collapse collapse" data-bs-parent="#orders">
                    <div class="accordion-body">
                        <p><strong>Fecha:</strong> <?= e($pedido['creado_en']) ?></p>
                        <p><strong>Direccion:</strong> <?= e($pedido['direccion_envio']) ?></p>
                        <div class="table-responsive">
                            <table class="table">
                                <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
                                <tbody>
                                    <?php foreach ($detalle as $d): ?>
                                        <tr>
                                            <td><?= e($d['marca']) ?> · <?= e($d['nombre']) ?></td>
                                            <td><?= (int) $d['cantidad'] ?></td>
                                            <td>Bs <?= number_format($d['precio_unitario'], 2) ?></td>
                                            <td>Bs <?= number_format($d['subtotal'], 2) ?></td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
