<?php
$pageTitle = 'Inicio';
require_once 'includes/header.php';

$destacados = $pdo->query('SELECT p.*, c.nombre AS categoria FROM productos p INNER JOIN categorias c ON c.id = p.categoria_id WHERE p.estado = 1 AND p.destacado = 1 ORDER BY p.id DESC')->fetchAll();
$nuevos = $pdo->query('SELECT p.*, c.nombre AS categoria FROM productos p INNER JOIN categorias c ON c.id = p.categoria_id WHERE p.estado = 1 AND p.nuevo = 1 ORDER BY p.creado_en DESC')->fetchAll();
$destacados = array_slice(groupCatalogProducts($destacados), 0, 8);
$nuevos = array_slice(groupCatalogProducts($nuevos), 0, 8);
?>
<section class="hero">
    <div class="container py-5">
        <div class="row align-items-center g-5">
            <div class="col-lg-6">
                <span class="section-kicker">Tienda deportiva</span>
                <h1>Caballero Sport</h1>
                <p class="lead">Descubre los modelos y colores de nuestro negocio: deportivos, urbanos y calzado de fútbol.</p>
                <form class="search-bar" action="catalogo.php" method="get">
                    <input type="search" name="q" class="form-control" placeholder="Buscar Nike, running, Jordan...">
                    <button class="btn btn-primary" type="submit"><i class="bi bi-search"></i> Buscar</button>
                </form>
            </div>
            <div class="col-lg-6">
                <div id="promoCarousel" class="carousel slide promo-carousel" data-bs-ride="carousel">
                    <div class="carousel-inner rounded-4 shadow">
                        <div class="carousel-item active">
                            <div class="promo-slide promo-red">
                                <img class="promo-photo" src="assets/img/productos/foto-15-2.webp" alt="Zapatilla celeste y blanca"><span>Tu próximo par</span><h2>Colores que destacan</h2><p>Explora el catálogo del negocio.</p>
                            </div>
                        </div>
                        <div class="carousel-item">
                            <div class="promo-slide promo-blue">
                                <img class="promo-photo" src="assets/img/productos/foto-13-1.webp" alt="Deportiva negra y naranja"><span>Nuevos ingresos</span>
                                <h2>Nike, Adidas y Jordan</h2>
                                <p>Consulta tallas y disponibilidad.</p>
                            </div>
                        </div>
                        <div class="carousel-item">
                            <div class="promo-slide promo-dark">
                                <img class="promo-photo" src="assets/img/productos/foto-12-2.webp" alt="Bolka roja y blanca"><span>Entra a la cancha</span><h2>Pasión por el fútbol</h2><p>Encuentra tu combinación de colores.</p>
                            </div>
                        </div>
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#promoCarousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon"></span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#promoCarousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="container py-5">
    <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
            <span class="section-kicker">Seleccionados</span>
            <h2 class="section-title">Productos destacados</h2>
        </div>
        <a href="catalogo.php" class="btn btn-outline-dark">Ver catalogo</a>
    </div>
    <div class="row g-4">
        <?php foreach ($destacados as $producto): ?>
            <?php include 'includes/product_card.php'; ?>
        <?php endforeach; ?>
    </div>
</section>

<section class="soft-band py-5">
    <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-4">
            <div>
                <span class="section-kicker">Recien llegados</span>
                <h2 class="section-title">Productos nuevos</h2>
            </div>
            <a href="catalogo.php?nuevo=1" class="btn btn-outline-dark">Ver nuevos</a>
        </div>
        <div class="row g-4">
            <?php foreach ($nuevos as $producto): ?>
                <?php include 'includes/product_card.php'; ?>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
