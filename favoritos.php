<?php
$pageTitle = 'Favoritos';
require_once 'includes/header.php';
requireLogin();

$stmt = $pdo->prepare('SELECT p.*, c.nombre AS categoria FROM favoritos f INNER JOIN productos p ON p.id = f.producto_id INNER JOIN categorias c ON c.id = p.categoria_id WHERE f.usuario_id = ? ORDER BY f.creado_en DESC');
$stmt->execute([$_SESSION['usuario_id']]);
$productos = $stmt->fetchAll();
?>
<section class="page-heading">
    <div class="container">
        <span class="section-kicker">Favoritos</span>
        <h1>Tus productos guardados</h1>
    </div>
</section>
<section class="container py-5">
    <div class="row g-4">
        <?php foreach ($productos as $producto): ?>
            <?php include 'includes/product_card.php'; ?>
        <?php endforeach; ?>
        <?php if (!$productos): ?>
            <div class="col-12"><div class="empty-state">Aun no agregaste favoritos.</div></div>
        <?php endif; ?>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
