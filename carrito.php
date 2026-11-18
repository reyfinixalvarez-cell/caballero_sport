<?php
$pageTitle = 'Carrito';
require_once 'includes/header.php';
requireLogin();

$stmt = $pdo->prepare('SELECT ca.cantidad, p.*, c.nombre AS categoria FROM carrito ca INNER JOIN productos p ON p.id = ca.producto_id INNER JOIN categorias c ON c.id = p.categoria_id WHERE ca.usuario_id = ? ORDER BY ca.creado_en DESC');
$stmt->execute([$_SESSION['usuario_id']]);
$items = $stmt->fetchAll();
$total = 0;
?>
<section class="page-heading">
    <div class="container">
        <span class="section-kicker">Carrito</span>
        <h1>Revisa tu compra</h1>
    </div>
</section>
<section class="container py-5">
    <?php if (!$items): ?>
        <div class="empty-state">Tu carrito esta vacio. <a href="catalogo.php">Ver catalogo</a></div>
    <?php else: ?>
        <div class="row g-4">
            <div class="col-lg-8">
                <div class="table-responsive content-panel">
                    <table class="table align-middle">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($items as $item): ?>
                                <?php
                                $precio = $item['precio_oferta'] ?: $item['precio'];
                                $subtotal = $precio * $item['cantidad'];
                                $total += $subtotal;
                                ?>
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-3">
                                            <img src="<?= productImage($item['imagen']) ?>" class="cart-thumb" alt="<?= e($item['nombre']) ?>">
                                            <div>
                                                <strong><?= e($item['nombre']) ?></strong>
                                                <p class="small text-muted mb-0"><?= e($item['marca']) ?> · Stock <?= (int) $item['stock'] ?></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Bs <?= number_format($precio, 2) ?></td>
                                    <td>
                                        <form action="carrito_accion.php" method="post" class="d-flex gap-2">
                                            <input type="hidden" name="accion" value="actualizar">
                                            <input type="hidden" name="producto_id" value="<?= (int) $item['id'] ?>">
                                            <input type="number" name="cantidad" class="form-control qty-input" min="1" max="<?= (int) $item['stock'] ?>" value="<?= (int) $item['cantidad'] ?>">
                                            <button class="btn btn-outline-primary btn-sm" type="submit"><i class="bi bi-arrow-repeat"></i></button>
                                        </form>
                                    </td>
                                    <td><strong>Bs <?= number_format($subtotal, 2) ?></strong></td>
                                    <td>
                                        <form action="carrito_accion.php" method="post" class="confirm-form" data-confirm="Eliminar producto del carrito?">
                                            <input type="hidden" name="accion" value="eliminar">
                                            <input type="hidden" name="producto_id" value="<?= (int) $item['id'] ?>">
                                            <button class="btn btn-outline-danger btn-sm" type="submit"><i class="bi bi-trash"></i></button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="summary-panel">
                    <h2>Resumen</h2>
                    <div class="d-flex justify-content-between mb-2"><span>Subtotal</span><strong>Bs <?= number_format($total, 2) ?></strong></div>
                    <div class="d-flex justify-content-between mb-3"><span>Envio</span><strong>Gratis</strong></div>
                    <hr>
                    <div class="d-flex justify-content-between fs-5 mb-4"><span>Total</span><strong>Bs <?= number_format($total, 2) ?></strong></div>
                    <a href="checkout.php" class="btn btn-primary w-100">Finalizar compra</a>
                </div>
            </div>
        </div>
    <?php endif; ?>
</section>
<?php require_once 'includes/footer.php'; ?>
