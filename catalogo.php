<?php
$pageTitle = 'Catalogo';
require_once 'includes/header.php';

$categorias = $pdo->query('SELECT * FROM categorias WHERE estado = 1 ORDER BY nombre')->fetchAll();
$marcas = $pdo->query('SELECT DISTINCT marca FROM productos WHERE estado = 1 ORDER BY marca')->fetchAll();

$where = ['p.estado = 1'];
$params = [];

if (!empty($_GET['q'])) {
    $where[] = '(p.nombre LIKE ? OR p.marca LIKE ? OR p.descripcion LIKE ? OR p.color LIKE ?)';
    $term = '%' . $_GET['q'] . '%';
    array_push($params, $term, $term, $term, $term);
}
if (!empty($_GET['color'])) {
    $where[] = 'p.color = ?';
    $params[] = $_GET['color'];
}
if (!empty($_GET['marca'])) {
    $where[] = 'p.marca = ?';
    $params[] = $_GET['marca'];
}
if (!empty($_GET['categoria'])) {
    $where[] = 'p.categoria_id = ?';
    $params[] = (int) $_GET['categoria'];
}
if (!empty($_GET['min'])) {
    $where[] = 'COALESCE(p.precio_oferta, p.precio) >= ?';
    $params[] = (float) $_GET['min'];
}
if (!empty($_GET['max'])) {
    $where[] = 'COALESCE(p.precio_oferta, p.precio) <= ?';
    $params[] = (float) $_GET['max'];
}
if (!empty($_GET['nuevo'])) {
    $where[] = 'p.nuevo = 1';
}
if (!empty($_GET['oferta'])) {
    $where[] = 'p.precio_oferta IS NOT NULL';
}

$sql = 'SELECT p.*, c.nombre AS categoria FROM productos p INNER JOIN categorias c ON c.id = p.categoria_id WHERE ' . implode(' AND ', $where) . ' ORDER BY p.creado_en DESC';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$productos = groupCatalogProducts($stmt->fetchAll());
?>
<section class="page-heading">
    <div class="container">
        <span class="section-kicker">Catalogo</span>
        <h1>Encuentra tus zapatillas</h1>
    </div>
</section>
<section class="container py-5">
    <form class="filter-panel mb-4" method="get">
        <div class="row g-3 align-items-end">
            <div class="col-md-4"><label class="form-label">Colores</label><select class="form-select" name="color"><option value="">Todos los colores</option>
            <?php foreach ($pdo->query('SELECT DISTINCT color FROM productos WHERE estado=1 ORDER BY color')->fetchAll() as $c): ?><option value="<?= e($c['color']) ?>" <?= ($_GET['color'] ?? '') === $c['color'] ? 'selected' : '' ?>><?= e($c['color']) ?></option><?php endforeach; ?>
            </select></div>
            <div class="col-md-4">
                <label class="form-label">Buscar</label>
                <input type="search" name="q" value="<?= e($_GET['q'] ?? '') ?>" class="form-control" placeholder="Nombre, marca o descripcion">
            </div>
            <div class="col-md-2">
                <label class="form-label">Marca</label>
                <select name="marca" class="form-select">
                    <option value="">Todas</option>
                    <?php foreach ($marcas as $m): ?>
                        <option value="<?= e($m['marca']) ?>" <?= ($_GET['marca'] ?? '') === $m['marca'] ? 'selected' : '' ?>><?= e($m['marca']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Categoria</label>
                <select name="categoria" class="form-select">
                    <option value="">Todas</option>
                    <?php foreach ($categorias as $cat): ?>
                        <option value="<?= (int) $cat['id'] ?>" <?= (string) ($_GET['categoria'] ?? '') === (string) $cat['id'] ? 'selected' : '' ?>><?= e($cat['nombre']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-1">
                <label class="form-label">Min</label>
                <input type="number" name="min" value="<?= e($_GET['min'] ?? '') ?>" class="form-control" min="0">
            </div>
            <div class="col-md-1">
                <label class="form-label">Max</label>
                <input type="number" name="max" value="<?= e($_GET['max'] ?? '') ?>" class="form-control" min="0">
            </div>
            <div class="col-md-2 d-flex gap-2">
                <button class="btn btn-primary flex-fill" type="submit">Filtrar</button>
                <a class="btn btn-outline-secondary" href="catalogo.php"><i class="bi bi-x-lg"></i></a>
            </div>
        </div>
    </form>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <p class="mb-0 text-muted"><?= count($productos) ?> producto(s) encontrados</p>
        <div class="d-flex gap-2">
            <a class="btn btn-sm btn-outline-danger" href="catalogo.php?oferta=1">Ofertas</a>
            <a class="btn btn-sm btn-outline-success" href="catalogo.php?nuevo=1">Nuevos</a>
        </div>
    </div>
    <div class="row g-4">
        <?php foreach ($productos as $producto): ?>
            <?php include 'includes/product_card.php'; ?>
        <?php endforeach; ?>
        <?php if (!$productos): ?>
            <div class="col-12"><div class="empty-state">No se encontraron productos con esos filtros.</div></div>
        <?php endif; ?>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
