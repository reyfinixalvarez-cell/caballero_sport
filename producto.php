<?php
$pageTitle = 'Detalle de producto';
require_once 'includes/header.php';

$id = (int) ($_GET['id'] ?? 0);
$stmt = $pdo->prepare('SELECT p.*, c.nombre AS categoria FROM productos p INNER JOIN categorias c ON c.id = p.categoria_id WHERE p.id = ? AND p.estado = 1');
$stmt->execute([$id]);
$producto = $stmt->fetch();
if (!$producto) {
    $_SESSION['flash'] = ['type' => 'error', 'message' => 'Producto no encontrado.'];
    redirect('catalogo.php');
}

$rel = $pdo->prepare('SELECT p.*, c.nombre AS categoria FROM productos p INNER JOIN categorias c ON c.id = p.categoria_id WHERE p.estado = 1 AND p.id <> ? AND (p.categoria_id = ? OR p.marca = ?) ');
$rel->execute([$id, $producto['categoria_id'], $producto['marca']]);
$variants = modelVariants($producto);
$variantIds = array_column($variants, 'id');
$relacionados = array_slice(groupCatalogProducts(array_values(array_filter($rel->fetchAll(), function ($row) use ($variantIds) { return !in_array($row['id'], $variantIds); }))), 0, 4);
?>
<section class="container py-5">
    <div class="row g-5 align-items-start">
        <div class="col-lg-6">
            <img src="<?= productImage($producto['imagen']) ?>" alt="<?= e($producto['nombre']) ?>" class="detail-image">
            <?php if (preg_match('/^(foto-\d+)-\d+\.webp$/', $producto['imagen'], $photoMatch)): ?>
                <p class="small text-muted mt-2">Imagen de catálogo retocada. <a href="assets/img/originales/<?= e($photoMatch[1]) ?>.jpg" target="_blank" rel="noopener">Ver fotografía original del negocio</a></p>
            <?php endif; ?>
        </div>
        <div class="col-lg-6">
            <span class="section-kicker"><?= e($producto['marca']) ?> · <?= e($producto['categoria']) ?></span>
            <h1 class="detail-title"><?= e(modelTitle($producto)) ?></h1>
            <p class="lead text-muted"><?= e($producto['descripcion']) ?></p>
            <div class="detail-price mb-3">
                <?php if ((float) $producto['precio'] <= 0): ?><span>Precio por confirmar</span>
                <?php elseif ($producto['precio_oferta']): ?>
                    <span>Bs <?= number_format($producto['precio_oferta'], 2) ?></span>
                    <del>Bs <?= number_format($producto['precio'], 2) ?></del>
                <?php else: ?>
                    <span>Bs <?= number_format($producto['precio'], 2) ?></span>
                <?php endif; ?>
            </div>
            <?php if (count($variants) > 1): ?>
            <h2 class="h5">Elige tu color</h2><div class="variant-thumbs" aria-label="Colores disponibles">
                <?php foreach ($variants as $variant): ?>
                    <a href="producto.php?id=<?= (int) $variant['id'] ?>" class="<?= (int) $variant['id'] === (int) $producto['id'] ? 'selected' : '' ?>" <?= (int) $variant['id'] === (int) $producto['id'] ? 'aria-current="true"' : '' ?>>
                        <img src="<?= productImage($variant['imagen']) ?>" alt="<?= e($variant['color']) ?>"><span><?= e($variant['color']) ?></span>
                    </a>
                <?php endforeach; ?>
            </div><p class="small text-muted">Toca una imagen para ver ese color. El precio y la disponibilidad corresponden al color elegido.</p>
            <?php endif; ?>
            <ul class="list-unstyled product-specs">
                <li><strong>Talla:</strong> <?= e($producto['talla']) ?></li>
                <li><?= colorSwatches($producto['color']) ?> <strong>Color:</strong> <?= e($producto['color']) ?></li>
                <li><strong>Stock:</strong> <?= (int) $producto['stock'] > 0 ? (int) $producto['stock'].' unidades' : 'Consultar disponibilidad' ?></li>
            </ul>
            <div class="d-flex gap-2 mt-4">
                <form action="carrito_accion.php" method="post">
                    <input type="hidden" name="accion" value="agregar">
                    <input type="hidden" name="producto_id" value="<?= (int) $producto['id'] ?>">
                    <input type="number" name="cantidad" value="1" min="1" max="<?= (int) $producto['stock'] ?>" class="form-control qty-input d-inline-block me-2">
                    <button class="btn btn-primary" type="submit" <?= (int) $producto['stock'] <= 0 || (float) $producto['precio'] <= 0 ? 'disabled' : '' ?>><i class="bi bi-bag-plus"></i> Agregar al carrito</button>
                </form>
                <form action="favorito_accion.php" method="post">
                    <input type="hidden" name="producto_id" value="<?= (int) $producto['id'] ?>">
                    <button class="btn btn-outline-danger" type="submit"><i class="bi bi-heart"></i></button>
                </form>
            </div>
        </div>
    </div>
</section>
<section class="soft-band py-5">
    <div class="container">
        <h2 class="section-title mb-4">Productos relacionados</h2>
        <div class="row g-4">
            <?php foreach ($relacionados as $producto): ?>
                <?php include 'includes/product_card.php'; ?>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
