const DB_KEY = 'caballero_sport_db_v1';
const SESSION_KEY = 'caballero_sport_uid';
const FLASH_KEY = 'caballero_sport_flash';
let MODEL_GROUPS = {};

function getDB() {
    let db = JSON.parse(localStorage.getItem(DB_KEY));
    if (!db) {
        db = JSON.parse(JSON.stringify(INITIAL_DATA));
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
    return db;
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function setFlash(type, message) {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ type, message }));
}

function showFlash() {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (raw && window.Swal) {
        sessionStorage.removeItem(FLASH_KEY);
        const f = JSON.parse(raw);
        Swal.fire({ icon: f.type || 'info', text: f.message || '', timer: 2600, showConfirmButton: false });
    }
}

function currentUser() {
    const uid = Number(localStorage.getItem(SESSION_KEY));
    if (!uid) return null;
    return getDB().usuarios.find(u => u.id === uid) || null;
}

function isAdminRoute() {
    return window.location.pathname.includes('/admin/');
}

function basePath() {
    return isAdminRoute() ? '../' : '';
}

function requireLogin() {
    if (!currentUser()) {
        setFlash('warning', 'Inicia sesion para continuar.');
        window.location.href = basePath() + 'login.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    const u = currentUser();
    if (!u || u.rol !== 'admin') {
        setFlash('error', 'Acceso restringido al administrador.');
        window.location.href = basePath() + 'login.html';
        return false;
    }
    return true;
}

function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

function fmtMoney(n) {
    return Number(n || 0).toFixed(2);
}

function productImage(img, admin = false) {
    const file = img && img.trim() ? img.trim() : 'placeholder.svg';
    return (admin ? '../' : '') + 'assets/img/productos/' + encodeURIComponent(file);
}

function colorSwatches(colorText) {
    const palette = {
        negro: '#111827', blanco: '#f8fafc', rojo: '#ef233c', azul: '#2563eb',
        'azul marino': '#1e3a8a', celeste: '#38bdf8', verde: '#16a34a',
        gris: '#6b7280', plata: '#cbd5e1', dorado: '#eab308', amarillo: '#facc15',
        naranja: '#f97316', rosa: '#f472b6', lila: '#a855f7', crema: '#fef3c7', beige: '#d6c7b2'
    };
    const parts = String(colorText || '').split('/').map(s => s.trim()).filter(Boolean);
    const dots = parts.map(p => {
        const hex = palette[p.toLowerCase()] || '#9ca3af';
        return `<span class="color-dot" style="background:${hex}" title="${esc(p)}"></span>`;
    }).join('');
    return dots ? `<div class="color-swatches" aria-label="Colores">${dots}</div>` : '';
}

function modelTitle(product) {
    const info = MODEL_GROUPS[product.imagen];
    return info ? info.title : String(product.nombre).split(' · ')[0];
}

function modelVariants(product) {
    const db = getDB();
    const info = MODEL_GROUPS[product.imagen];
    if (!info || !Array.isArray(info.images)) return [product];
    const active = db.productos.filter(p => p.estado === 1 && info.images.includes(p.imagen));
    active.sort((a, b) => info.images.indexOf(a.imagen) - info.images.indexOf(b.imagen));
    return active.length ? active : [product];
}

function groupCatalogProducts(products) {
    const grouped = [];
    const seen = new Set();
    products.forEach(p => {
        const info = MODEL_GROUPS[p.imagen];
        const key = info ? info.key : 'prod-' + p.id;
        if (seen.has(key)) return;
        seen.add(key);
        const variants = modelVariants(p);
        const preferred = variants.find(v => Number(v.precio) > 0) || variants[0] || p;
        grouped.push(preferred);
    });
    return grouped;
}

function renderProductCard(product) {
    const db = getDB();
    const cat = db.categorias.find(c => c.id === product.categoria_id);
    const catName = cat ? cat.nombre : '';
    const variants = modelVariants(product);
    const title = modelTitle(product);
    const hasPrice = Number(product.precio) > 0;
    const isSale = hasPrice && product.precio_oferta && Number(product.precio_oferta) > 0;

    let priceHtml = `<span class="fw-bold text-primary">Precio por confirmar</span>`;
    if (isSale) {
        priceHtml = `<span class="fw-bold text-danger">Bs ${fmtMoney(product.precio_oferta)}</span> <span class="old-price">Bs ${fmtMoney(product.precio)}</span>`;
    } else if (hasPrice) {
        priceHtml = `<span class="fw-bold">Bs ${fmtMoney(product.precio)}</span>`;
    }

    let variantsHtml = '';
    if (variants.length > 1) {
        variantsHtml = `<div class="variant-thumbs compact">` + variants.map(v => `
            <a href="producto.html?id=${v.id}" class="${v.id === product.id ? 'selected' : ''}" title="${esc(v.color)}">
                <img src="${productImage(v.imagen)}" alt="${esc(v.color)}">
            </a>`).join('') + `</div>`;
    }

    return `
    <div class="col-sm-6 col-lg-3">
        <article class="product-card h-100 d-flex flex-column">
            <a href="producto.html?id=${product.id}" class="product-image-wrap">
                <img src="${productImage(product.imagen)}" alt="${esc(title)}" class="product-image">
                <div class="product-badges">
                    ${product.nuevo ? '<span class="badge bg-dark">Nuevo</span>' : ''}
                    ${isSale ? '<span class="badge bg-danger">Oferta</span>' : ''}
                </div>
            </a>
            <div class="p-3 d-flex flex-column flex-grow-1">
                <span class="small text-muted">${esc(product.marca)} · ${esc(catName)}</span>
                <h3 class="product-title mt-1"><a href="producto.html?id=${product.id}">${esc(title)}</a></h3>
                ${colorSwatches(product.color)}
                ${variantsHtml}
                <div class="mt-auto pt-2">
                    <div class="mb-2">${priceHtml}</div>
                    <div class="d-flex gap-2">
                        <a href="producto.html?id=${product.id}" class="btn btn-sm btn-outline-dark flex-fill">Ver</a>
                        <button type="button" class="btn btn-sm btn-primary" onclick="addToCart(${product.id}, 1)" ${(!hasPrice || product.stock <= 0) ? 'disabled' : ''} title="Agregar al carrito">
                            <i class="bi bi-bag-plus"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="toggleFavorite(${product.id})" title="Favorito">
                            <i class="bi bi-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    </div>`;
}

function renderStoreShell() {
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    if (!header || !footer) return;

    const user = currentUser();
    const db = getDB();
    const cartCount = user ? db.carrito.filter(c => c.usuario_id === user.id).reduce((acc, i) => acc + i.cantidad, 0) : 0;

    header.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark sticky-top">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="index.html">
                <span class="logo-mark">CS</span> Caballero Sport
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="mainNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" href="index.html">Inicio</a></li>
                    <li class="nav-item"><a class="nav-link" href="catalogo.html">Catalogo</a></li>
                    <li class="nav-item"><a class="nav-link" href="catalogo.html?oferta=1">Ofertas</a></li>
                </ul>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    ${user ? `
                        <a class="btn btn-outline-light btn-sm" href="favoritos.html"><i class="bi bi-heart"></i> Favoritos</a>
                        <a class="btn btn-outline-light btn-sm" href="carrito.html"><i class="bi bi-bag"></i> Carrito (${cartCount})</a>
                        <a class="btn btn-outline-light btn-sm" href="pedidos.html">Pedidos</a>
                        <a class="btn btn-outline-light btn-sm" href="perfil.html">${esc(user.nombre.split(' ')[0])}</a>
                        ${user.rol === 'admin' ? '<a class="btn btn-warning btn-sm" href="admin/index.html">Admin</a>' : ''}
                        <button type="button" class="btn btn-danger btn-sm" onclick="logoutUser()">Salir</button>
                    ` : `
                        <a class="btn btn-outline-light btn-sm" href="login.html">Ingresar</a>
                        <a class="btn btn-primary btn-sm" href="registro.html">Crear cuenta</a>
                    `}
                </div>
            </div>
        </div>
    </nav>`;

    footer.innerHTML = `
    <footer class="footer py-5 mt-5">
        <div class="container">
            <div class="row g-4">
                <div class="col-md-5">
                    <h5 class="fw-bold">Caballero Sport</h5>
                    <p class="text-white-50 mb-0">Tienda online de zapatillas deportivas, running, urbano, futbol y basketball.</p>
                </div>
                <div class="col-md-3">
                    <h6 class="fw-bold">Navegacion</h6>
                    <ul class="list-unstyled text-white-50">
                        <li><a href="index.html" class="text-decoration-none">Inicio</a></li>
                        <li><a href="catalogo.html" class="text-decoration-none">Catalogo</a></li>
                        <li><a href="carrito.html" class="text-decoration-none">Carrito</a></li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h6 class="fw-bold">Contacto</h6>
                    <p class="text-white-50 mb-1">Atencion directa y consultas de tallas en tienda.</p>
                    <small class="text-white-50">&copy; 2026 Caballero Sport</small>
                </div>
            </div>
        </div>
    </footer>`;
}

function renderAdminShell() {
    const header = document.getElementById('admin-header');
    if (!header) return;
    header.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top mb-4">
        <div class="container">
            <a class="navbar-brand fw-bold" href="index.html"><span class="logo-mark me-2">CS</span> Admin Caballero Sport</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="adminNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item"><a class="nav-link" href="index.html">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="productos.html">Productos</a></li>
                    <li class="nav-item"><a class="nav-link" href="categorias.html">Categorias</a></li>
                    <li class="nav-item"><a class="nav-link" href="pedidos.html">Pedidos</a></li>
                    <li class="nav-item"><a class="nav-link" href="usuarios.html">Usuarios</a></li>
                </ul>
                <div class="d-flex gap-2">
                    <a class="btn btn-outline-light btn-sm" href="../index.html">Ver tienda</a>
                    <button class="btn btn-danger btn-sm" type="button" onclick="logoutUser()">Salir</button>
                </div>
            </div>
        </div>
    </nav>`;
}

// --- ACCIONES GLOBALES ---
window.addToCart = function(productoId, cantidad = 1) {
    if (!requireLogin()) return;
    const user = currentUser();
    const db = getDB();
    const prod = db.productos.find(p => p.id === Number(productoId) && p.estado === 1);
    if (!prod) {
        setFlash('error', 'Producto no disponible.');
        window.location.href = 'catalogo.html';
        return;
    }
    if (prod.stock <= 0 || Number(prod.precio) <= 0) {
        setFlash('warning', 'Consulta el precio y la disponibilidad de este modelo.');
        window.location.href = 'producto.html?id=' + prod.id;
        return;
    }
    const qty = Math.min(Math.max(1, Number(cantidad)), prod.stock);
    const existing = db.carrito.find(c => c.usuario_id === user.id && c.producto_id === prod.id);
    if (existing) {
        existing.cantidad = Math.min(existing.cantidad + qty, prod.stock);
    } else {
        db.carrito.push({ usuario_id: user.id, producto_id: prod.id, cantidad: qty, creado_en: new Date().toISOString() });
    }
    saveDB(db);
    setFlash('success', 'Producto agregado al carrito.');
    window.location.href = 'carrito.html';
};

window.toggleFavorite = function(productoId) {
    if (!requireLogin()) return;
    const user = currentUser();
    const db = getDB();
    const idx = db.favoritos.findIndex(f => f.usuario_id === user.id && f.producto_id === Number(productoId));
    if (idx >= 0) {
        db.favoritos.splice(idx, 1);
        saveDB(db);
        setFlash('info', 'Producto eliminado de favoritos.');
    } else {
        db.favoritos.push({ usuario_id: user.id, producto_id: Number(productoId), creado_en: new Date().toISOString() });
        saveDB(db);
        setFlash('success', 'Producto agregado a favoritos.');
    }
    window.location.reload();
};

window.logoutUser = function() {
    localStorage.removeItem(SESSION_KEY);
    setFlash('success', 'Sesion cerrada correctamente.');
    window.location.href = basePath() + 'index.html';
};

// --- INICIALIZACIÓN POR PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(basePath() + 'database/modelos_colores.json');
        if (res.ok) MODEL_GROUPS = await res.json();
    } catch (e) {}

    if (isAdminRoute()) {
        if (!requireAdmin()) return;
        renderAdminShell();
    } else {
        renderStoreShell();
    }
    showFlash();

    const page = document.body.dataset.page;
    if (page && typeof PAGE_HANDLERS[page] === 'function') {
        PAGE_HANDLERS[page]();
    }
});

const PAGE_HANDLERS = {
    home() {
        const db = getDB();
        const activos = db.productos.filter(p => p.estado === 1);
        const destacados = groupCatalogProducts(activos.filter(p => p.destacado === 1)).slice(0, 8);
        const nuevos = groupCatalogProducts(activos.filter(p => p.nuevo === 1)).slice(0, 4);
        const elDest = document.getElementById('featured-products');
        const elNuev = document.getElementById('new-products');
        if (elDest) elDest.innerHTML = destacados.map(renderProductCard).join('');
        if (elNuev) elNuev.innerHTML = nuevos.map(renderProductCard).join('');
    },

    catalogo() {
        const db = getDB();
        const params = new URLSearchParams(window.location.search);
        const q = (params.get('q') || '').trim().toLowerCase();
        const color = params.get('color') || '';
        const marca = params.get('marca') || '';
        const categoria = params.get('categoria') || '';
        const min = params.get('min') ? Number(params.get('min')) : null;
        const max = params.get('max') ? Number(params.get('max')) : null;
        const nuevo = params.get('nuevo');
        const oferta = params.get('oferta');

        const activos = db.productos.filter(p => p.estado === 1);
        const colores = [...new Set(activos.map(p => p.color))].sort();
        const marcas = [...new Set(activos.map(p => p.marca))].sort();
        const categorias = db.categorias.filter(c => c.estado === 1).sort((a, b) => a.nombre.localeCompare(b.nombre));

        document.getElementById('filter-color').innerHTML = `<option value="">Todos los colores</option>` + colores.map(c => `<option value="${esc(c)}" ${color === c ? 'selected' : ''}>${esc(c)}</option>`).join('');
        document.getElementById('filter-marca').innerHTML = `<option value="">Todas</option>` + marcas.map(m => `<option value="${esc(m)}" ${marca === m ? 'selected' : ''}>${esc(m)}</option>`).join('');
        document.getElementById('filter-categoria').innerHTML = `<option value="">Todas</option>` + categorias.map(c => `<option value="${c.id}" ${categoria === String(c.id) ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('');
        document.getElementById('filter-q').value = params.get('q') || '';
        document.getElementById('filter-min').value = params.get('min') || '';
        document.getElementById('filter-max').value = params.get('max') || '';

        const filtrados = activos.filter(p => {
            if (q && !(p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q) || p.color.toLowerCase().includes(q))) return false;
            if (color && p.color !== color) return false;
            if (marca && p.marca !== marca) return false;
            if (categoria && String(p.categoria_id) !== categoria) return false;
            const pEff = Number(p.precio_oferta || p.precio);
            if (min !== null && pEff < min) return false;
            if (max !== null && pEff > max) return false;
            if (nuevo && p.nuevo !== 1) return false;
            if (oferta && !p.precio_oferta) return false;
            return true;
        });

        const agrupados = groupCatalogProducts(filtrados);
        document.getElementById('catalog-count').textContent = `${agrupados.length} producto(s) encontrados`;
        const grid = document.getElementById('catalog-grid');
        grid.innerHTML = agrupados.length
            ? agrupados.map(renderProductCard).join('')
            : `<div class="col-12"><div class="empty-state">No se encontraron productos con esos filtros.</div></div>`;
    },

    producto() {
        const db = getDB();
        const id = Number(new URLSearchParams(window.location.search).get('id'));
        const prod = db.productos.find(p => p.id === id && p.estado === 1);
        if (!prod) {
            setFlash('error', 'Producto no encontrado.');
            window.location.href = 'catalogo.html';
            return;
        }
        const cat = db.categorias.find(c => c.id === prod.categoria_id);
        const variants = modelVariants(prod);
        const variantIds = variants.map(v => v.id);
        const relRaw = db.productos.filter(p => p.estado === 1 && !variantIds.includes(p.id) && (p.categoria_id === prod.categoria_id || p.marca === prod.marca));
        const relacionados = groupCatalogProducts(relRaw).slice(0, 4);

        const origMatch = prod.imagen.match(/^(foto-\d+)-\d+\.webp$/);
        const origHtml = origMatch ? `<p class="small text-muted mt-2">Imagen de catálogo retocada. <a href="assets/img/originales/${origMatch[1]}.jpg" target="_blank" rel="noopener">Ver fotografía original del negocio</a></p>` : '';

        let priceHtml = `<span>Precio por confirmar</span>`;
        if (Number(prod.precio) > 0) {
            priceHtml = prod.precio_oferta
                ? `<span>Bs ${fmtMoney(prod.precio_oferta)}</span> <del>Bs ${fmtMoney(prod.precio)}</del>`
                : `<span>Bs ${fmtMoney(prod.precio)}</span>`;
        }

        let variantsHtml = '';
        if (variants.length > 1) {
            variantsHtml = `
            <h2 class="h5">Elige tu color</h2>
            <div class="variant-thumbs" aria-label="Colores disponibles">
                ${variants.map(v => `
                    <a href="producto.html?id=${v.id}" class="${v.id === prod.id ? 'selected' : ''}">
                        <img src="${productImage(v.imagen)}" alt="${esc(v.color)}"><span>${esc(v.color)}</span>
                    </a>`).join('')}
            </div>
            <p class="small text-muted">Toca una imagen para ver ese color. El precio y la disponibilidad corresponden al color elegido.</p>`;
        }

        const disabled = prod.stock <= 0 || Number(prod.precio) <= 0 ? 'disabled' : '';
        document.getElementById('product-detail').innerHTML = `
        <div class="row g-5 align-items-start">
            <div class="col-lg-6">
                <img src="${productImage(prod.imagen)}" alt="${esc(prod.nombre)}" class="detail-image">
                ${origHtml}
            </div>
            <div class="col-lg-6">
                <span class="section-kicker">${esc(prod.marca)} · ${esc(cat ? cat.nombre : '')}</span>
                <h1 class="detail-title">${esc(modelTitle(prod))}</h1>
                <p class="lead text-muted">${esc(prod.descripcion)}</p>
                <div class="detail-price mb-3">${priceHtml}</div>
                ${variantsHtml}
                <ul class="list-unstyled product-specs">
                    <li><strong>Talla:</strong> ${esc(prod.talla)}</li>
                    <li>${colorSwatches(prod.color)} <strong>Color:</strong> ${esc(prod.color)}</li>
                    <li><strong>Stock:</strong> ${prod.stock > 0 ? prod.stock + ' unidades' : 'Consultar disponibilidad'}</li>
                </ul>
                <div class="d-flex gap-2 mt-4">
                    <div class="d-flex">
                        <input type="number" id="detail-qty" value="1" min="1" max="${Math.max(1, prod.stock)}" class="form-control qty-input d-inline-block me-2">
                        <button class="btn btn-primary" type="button" ${disabled} onclick="addToCart(${prod.id}, document.getElementById('detail-qty').value)"><i class="bi bi-bag-plus"></i> Agregar al carrito</button>
                    </div>
                    <button class="btn btn-outline-danger" type="button" onclick="toggleFavorite(${prod.id})"><i class="bi bi-heart"></i></button>
                </div>
            </div>
        </div>`;

        document.getElementById('related-products').innerHTML = relacionados.map(renderProductCard).join('');
    },

    carrito() {
        if (!requireLogin()) return;
        const user = currentUser();
        const db = getDB();
        const items = db.carrito.filter(c => c.usuario_id === user.id).map(c => ({
            ...c,
            prod: db.productos.find(p => p.id === c.producto_id)
        })).filter(i => i.prod);

        const wrap = document.getElementById('cart-container');
        if (!items.length) {
            wrap.innerHTML = `<div class="empty-state">Tu carrito esta vacio. <a href="catalogo.html">Ver catalogo</a></div>`;
            return;
        }

        let total = 0;
        const rows = items.map(i => {
            const precio = Number(i.prod.precio_oferta || i.prod.precio);
            const sub = precio * i.cantidad;
            total += sub;
            return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img src="${productImage(i.prod.imagen)}" class="cart-thumb" alt="${esc(i.prod.nombre)}">
                        <div>
                            <strong>${esc(i.prod.nombre)}</strong>
                            <p class="small text-muted mb-0">${esc(i.prod.marca)} · Stock ${i.prod.stock}</p>
                        </div>
                    </div>
                </td>
                <td>Bs ${fmtMoney(precio)}</td>
                <td>
                    <div class="d-flex gap-2">
                        <input type="number" id="qty-${i.prod.id}" class="form-control qty-input" min="1" max="${i.prod.stock}" value="${i.cantidad}">
                        <button class="btn btn-outline-primary btn-sm" type="button" onclick="updateCartItem(${i.prod.id})"><i class="bi bi-arrow-repeat"></i></button>
                    </div>
                </td>
                <td><strong>Bs ${fmtMoney(sub)}</strong></td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" type="button" onclick="removeCartItem(${i.prod.id})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`;
        }).join('');

        wrap.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-8">
                <div class="table-responsive content-panel">
                    <table class="table align-middle">
                        <thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="summary-panel">
                    <h2>Resumen</h2>
                    <div class="d-flex justify-content-between mb-2"><span>Subtotal</span><strong>Bs ${fmtMoney(total)}</strong></div>
                    <div class="d-flex justify-content-between mb-3"><span>Envio</span><strong>Gratis</strong></div>
                    <hr>
                    <div class="d-flex justify-content-between fs-5 mb-4"><span>Total</span><strong>Bs ${fmtMoney(total)}</strong></div>
                    <a href="checkout.html" class="btn btn-primary w-100">Finalizar compra</a>
                </div>
            </div>
        </div>`;

        window.updateCartItem = function(prodId) {
            const db2 = getDB();
            const prod = db2.productos.find(p => p.id === prodId);
            const item = db2.carrito.find(c => c.usuario_id === user.id && c.producto_id === prodId);
            const val = Number(document.getElementById('qty-' + prodId).value);
            if (prod && item) {
                item.cantidad = Math.min(Math.max(1, val), prod.stock);
                saveDB(db2);
                setFlash('success', 'Cantidad actualizada.');
                window.location.reload();
            }
        };

        window.removeCartItem = function(prodId) {
            Swal.fire({
                icon: 'warning', text: 'Eliminar producto del carrito?',
                showCancelButton: true, confirmButtonText: 'Si, continuar', cancelButtonText: 'Cancelar'
            }).then(res => {
                if (res.isConfirmed) {
                    const db2 = getDB();
                    db2.carrito = db2.carrito.filter(c => !(c.usuario_id === user.id && c.producto_id === prodId));
                    saveDB(db2);
                    setFlash('info', 'Producto eliminado del carrito.');
                    window.location.reload();
                }
            });
        };
    },

    checkout() {
        if (!requireLogin()) return;
        const user = currentUser();
        const db = getDB();
        const items = db.carrito.filter(c => c.usuario_id === user.id).map(c => ({
            ...c, prod: db.productos.find(p => p.id === c.producto_id)
        })).filter(i => i.prod);

        if (!items.length) {
            setFlash('warning', 'Tu carrito esta vacio.');
            window.location.href = 'carrito.html';
            return;
        }
        const total = items.reduce((sum, i) => sum + Number(i.prod.precio_oferta || i.prod.precio) * i.cantidad, 0);
        document.getElementById('checkout-direccion').value = user.direccion || '';
        document.getElementById('checkout-btn').textContent = `Confirmar pedido por Bs ${fmtMoney(total)}`;

        document.getElementById('checkout-form').addEventListener('submit', e => {
            e.preventDefault();
            const dir = document.getElementById('checkout-direccion').value.trim();
            if (!dir) return;
            const db2 = getDB();
            const detalles = [];
            for (const i of items) {
                const pDB = db2.productos.find(p => p.id === i.prod.id);
                if (!pDB || i.cantidad > pDB.stock) {
                    Swal.fire({ icon: 'error', text: 'Stock insuficiente para ' + i.prod.nombre });
                    return;
                }
                const precio = Number(pDB.precio_oferta || pDB.precio);
                detalles.push({ producto_id: pDB.id, nombre: pDB.nombre, marca: pDB.marca, cantidad: i.cantidad, precio_unitario: precio, subtotal: precio * i.cantidad });
                pDB.stock -= i.cantidad;
            }
            const nextId = db2.pedidos.reduce((m, p) => Math.max(m, p.id), 0) + 1;
            db2.pedidos.unshift({
                id: nextId, usuario_id: user.id, total, estado: 'Pendiente',
                direccion_envio: dir, creado_en: new Date().toLocaleString(), detalles
            });
            db2.carrito = db2.carrito.filter(c => c.usuario_id !== user.id);
            saveDB(db2);
            setFlash('success', 'Compra simulada realizada correctamente.');
            window.location.href = 'pedidos.html';
        });
    },

    favoritos() {
        if (!requireLogin()) return;
        const user = currentUser();
        const db = getDB();
        const favProds = db.favoritos.filter(f => f.usuario_id === user.id)
            .map(f => db.productos.find(p => p.id === f.producto_id && p.estado === 1))
            .filter(Boolean);
        const grid = document.getElementById('favorites-grid');
        grid.innerHTML = favProds.length
            ? favProds.map(renderProductCard).join('')
            : `<div class="col-12"><div class="empty-state">Aun no agregaste favoritos.</div></div>`;
    },

    pedidos() {
        if (!requireLogin()) return;
        const user = currentUser();
        const db = getDB();
        const pedidos = db.pedidos.filter(p => p.usuario_id === user.id);
        const wrap = document.getElementById('orders');
        if (!pedidos.length) {
            wrap.innerHTML = `<div class="empty-state">Aun no tienes pedidos.</div>`;
            return;
        }
        wrap.innerHTML = pedidos.map(p => `
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#pedido${p.id}">
                    Pedido #${p.id} · ${esc(p.estado)} · Bs ${fmtMoney(p.total)}
                </button>
            </h2>
            <div id="pedido${p.id}" class="accordion-collapse collapse" data-bs-parent="#orders">
                <div class="accordion-body">
                    <p><strong>Fecha:</strong> ${esc(p.creado_en)}</p>
                    <p><strong>Direccion:</strong> ${esc(p.direccion_envio)}</p>
                    <div class="table-responsive">
                        <table class="table">
                            <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
                            <tbody>
                                ${p.detalles.map(d => `
                                    <tr>
                                        <td>${esc(d.marca)} · ${esc(d.nombre)}</td>
                                        <td>${d.cantidad}</td>
                                        <td>Bs ${fmtMoney(d.precio_unitario)}</td>
                                        <td>Bs ${fmtMoney(d.subtotal)}</td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`).join('');
    },

    perfil() {
        if (!requireLogin()) return;
        const user = currentUser();
        document.getElementById('perf-nombre').value = user.nombre;
        document.getElementById('perf-correo').value = user.correo;
        document.getElementById('perf-telefono').value = user.telefono || '';
        document.getElementById('perf-direccion').value = user.direccion || '';

        document.getElementById('perfil-form').addEventListener('submit', e => {
            e.preventDefault();
            const nombre = document.getElementById('perf-nombre').value.trim();
            const telefono = document.getElementById('perf-telefono').value.trim();
            const direccion = document.getElementById('perf-direccion').value.trim();
            const nueva = document.getElementById('perf-pass').value;
            if (!nombre) return Swal.fire({ icon: 'error', text: 'El nombre es obligatorio.' });
            if (nueva && nueva.length < 6) return Swal.fire({ icon: 'error', text: 'La nueva contrasena debe tener al menos 6 caracteres.' });

            const db = getDB();
            const uDB = db.usuarios.find(u => u.id === user.id);
            uDB.nombre = nombre;
            uDB.telefono = telefono;
            uDB.direccion = direccion;
            if (nueva) uDB.contrasena = nueva;
            saveDB(db);
            setFlash('success', 'Perfil actualizado.');
            window.location.reload();
        });
    },

    login() {
        document.getElementById('login-form').addEventListener('submit', e => {
            e.preventDefault();
            const correo = document.getElementById('login-correo').value.trim().toLowerCase();
            const pass = document.getElementById('login-pass').value;
            const db = getDB();
            const user = db.usuarios.find(u => u.correo.toLowerCase() === correo && u.contrasena === pass);
            if (user) {
                localStorage.setItem(SESSION_KEY, user.id);
                setFlash('success', 'Bienvenido a Caballero Sport.');
                window.location.href = user.rol === 'admin' ? 'admin/index.html' : 'index.html';
            } else {
                Swal.fire({ icon: 'error', text: 'Correo o contrasena incorrectos.' });
            }
        });
    },

    registro() {
        document.getElementById('registro-form').addEventListener('submit', e => {
            e.preventDefault();
            const nombre = document.getElementById('reg-nombre').value.trim();
            const correo = document.getElementById('reg-correo').value.trim().toLowerCase();
            const pass = document.getElementById('reg-pass').value;
            const telefono = document.getElementById('reg-tel').value.trim();
            const direccion = document.getElementById('reg-dir').value.trim();

            if (!nombre || !correo.includes('@') || pass.length < 6) {
                return Swal.fire({ icon: 'error', text: 'Completa los datos correctamente. La contrasena debe tener al menos 6 caracteres.' });
            }
            const db = getDB();
            if (db.usuarios.some(u => u.correo.toLowerCase() === correo)) {
                return Swal.fire({ icon: 'warning', text: 'Ese correo ya esta registrado.' });
            }
            const nextId = db.usuarios.reduce((m, u) => Math.max(m, u.id), 0) + 1;
            db.usuarios.push({ id: nextId, nombre, correo, contrasena: pass, telefono, direccion, rol: 'cliente', token_recuperacion: null, creado_en: new Date().toLocaleString() });
            saveDB(db);
            setFlash('success', 'Cuenta creada. Ahora inicia sesion.');
            window.location.href = 'login.html';
        });
    },

    recuperar() {
        document.getElementById('recuperar-form').addEventListener('submit', e => {
            e.preventDefault();
            const correo = document.getElementById('rec-correo').value.trim().toLowerCase();
            const db = getDB();
            const user = db.usuarios.find(u => u.correo.toLowerCase() === correo);
            const resultBox = document.getElementById('token-result');
            if (user) {
                const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
                user.token_recuperacion = token;
                saveDB(db);
                Swal.fire({ icon: 'success', text: 'Token generado para recuperar la cuenta.', timer: 2000, showConfirmButton: false });
                resultBox.innerHTML = `
                    <div class="alert alert-info mt-3">Token de recuperacion simulado: <strong>${token}</strong></div>
                    <a class="btn btn-outline-primary w-100" href="restablecer.html?token=${token}">Restablecer contrasena</a>`;
            } else {
                Swal.fire({ icon: 'warning', text: 'Si el correo existe, se generara un token.' });
                resultBox.innerHTML = '';
            }
        });
    },

    restablecer() {
        const token = new URLSearchParams(window.location.search).get('token') || '';
        const db = getDB();
        const user = db.usuarios.find(u => u.token_recuperacion && u.token_recuperacion === token);
        if (!user) {
            setFlash('error', 'Token invalido o vencido.');
            window.location.href = 'recuperar.html';
            return;
        }
        document.getElementById('rest-correo').textContent = 'Cuenta: ' + user.correo;
        document.getElementById('restablecer-form').addEventListener('submit', e => {
            e.preventDefault();
            const pass = document.getElementById('rest-pass').value;
            if (pass.length < 6) return Swal.fire({ icon: 'error', text: 'La contrasena debe tener al menos 6 caracteres.' });
            user.contrasena = pass;
            user.token_recuperacion = null;
            saveDB(db);
            setFlash('success', 'Contrasena actualizada. Inicia sesion.');
            window.location.href = 'login.html';
        });
    },

    // --- PANEL ADMINISTRADOR ---
    adminIndex() {
        const db = getDB();
        document.getElementById('stat-productos').textContent = db.productos.length;
        document.getElementById('stat-clientes').textContent = db.usuarios.filter(u => u.rol === 'cliente').length;
        document.getElementById('stat-pedidos').textContent = db.pedidos.length;
        const ventas = db.pedidos.reduce((s, p) => s + Number(p.total), 0);
        document.getElementById('stat-ventas').textContent = 'Bs ' + fmtMoney(ventas);

        const ultimos = db.pedidos.slice(0, 5);
        document.getElementById('admin-last-orders').innerHTML = ultimos.length ? ultimos.map(p => {
            const u = db.usuarios.find(x => x.id === p.usuario_id);
            return `<tr><td>#${p.id}</td><td>${esc(u ? u.nombre : 'Cliente')}</td><td>Bs ${fmtMoney(p.total)}</td><td><span class="badge bg-secondary">${esc(p.estado)}</span></td><td>${esc(p.creado_en)}</td></tr>`;
        }).join('') : `<tr><td colspan="5" class="text-center text-muted">Aun no hay pedidos registrados.</td></tr>`;
    },

    adminProductos() {
        const db = getDB();
        const editId = Number(new URLSearchParams(window.location.search).get('editar'));
        const editItem = editId ? db.productos.find(p => p.id === editId) : null;

        document.getElementById('prod-form-title').textContent = editItem ? 'Editar producto' : 'Agregar producto';
        document.getElementById('prod-categoria').innerHTML = db.categorias.map(c => `<option value="${c.id}" ${editItem && editItem.categoria_id === c.id ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('');

        if (editItem) {
            document.getElementById('prod-id').value = editItem.id;
            document.getElementById('prod-nombre').value = editItem.nombre;
            document.getElementById('prod-marca').value = editItem.marca;
            document.getElementById('prod-talla').value = editItem.talla;
            document.getElementById('prod-color').value = editItem.color;
            document.getElementById('prod-imagen').value = editItem.imagen;
            document.getElementById('prod-descripcion').value = editItem.descripcion;
            document.getElementById('prod-precio').value = editItem.precio;
            document.getElementById('prod-oferta').value = editItem.precio_oferta || '';
            document.getElementById('prod-stock').value = editItem.stock;
            document.getElementById('prod-destacado').checked = editItem.destacado === 1;
            document.getElementById('prod-nuevo').checked = editItem.nuevo === 1;
            document.getElementById('prod-estado').checked = editItem.estado === 1;
            document.getElementById('prod-cancel-wrap').innerHTML = `<a class="btn btn-link w-100" href="productos.html">Cancelar</a>`;
        }

        document.getElementById('admin-prod-form').addEventListener('submit', e => {
            e.preventDefault();
            const db2 = getDB();
            const id = Number(document.getElementById('prod-id').value);
            const payload = {
                categoria_id: Number(document.getElementById('prod-categoria').value),
                nombre: document.getElementById('prod-nombre').value.trim(),
                marca: document.getElementById('prod-marca').value.trim(),
                talla: document.getElementById('prod-talla').value.trim(),
                color: document.getElementById('prod-color').value.trim(),
                imagen: document.getElementById('prod-imagen').value.trim() || 'placeholder.svg',
                descripcion: document.getElementById('prod-descripcion').value.trim(),
                precio: Number(document.getElementById('prod-precio').value),
                precio_oferta: document.getElementById('prod-oferta').value !== '' ? Number(document.getElementById('prod-oferta').value) : null,
                stock: Number(document.getElementById('prod-stock').value),
                destacado: document.getElementById('prod-destacado').checked ? 1 : 0,
                nuevo: document.getElementById('prod-nuevo').checked ? 1 : 0,
                estado: document.getElementById('prod-estado').checked ? 1 : 0
            };
            if (id > 0) {
                const idx = db2.productos.findIndex(p => p.id === id);
                if (idx >= 0) db2.productos[idx] = { ...db2.productos[idx], ...payload };
                setFlash('success', 'Producto actualizado.');
            } else {
                const nextId = db2.productos.reduce((m, p) => Math.max(m, p.id), 0) + 1;
                db2.productos.unshift({ id: nextId, ...payload });
                setFlash('success', 'Producto agregado.');
            }
            saveDB(db2);
            window.location.href = 'productos.html';
        });

        window.deleteAdminProd = function(id) {
            Swal.fire({ icon: 'warning', text: 'Eliminar producto?', showCancelButton: true, confirmButtonText: 'Si, continuar', cancelButtonText: 'Cancelar' }).then(r => {
                if (r.isConfirmed) {
                    const db2 = getDB();
                    const p = db2.productos.find(x => x.id === id);
                    if (p) p.estado = 0;
                    saveDB(db2);
                    setFlash('info', 'Producto eliminado del catalogo.');
                    window.location.reload();
                }
            });
        };

        document.getElementById('admin-prod-tbody').innerHTML = [...db.productos].sort((a, b) => b.id - a.id).map(p => `
        <tr>
            <td><img src="${productImage(p.imagen, true)}" class="cart-thumb" alt=""> ${esc(p.nombre)}</td>
            <td>${esc(p.marca)}</td>
            <td>${Number(p.precio) > 0 ? 'Bs ' + fmtMoney(p.precio_oferta || p.precio) : 'Por confirmar'}</td>
            <td>${p.stock}</td>
            <td>${p.estado ? 'Activo' : 'Oculto'}</td>
            <td class="text-end">
                <a class="btn btn-sm btn-outline-primary" href="productos.html?editar=${p.id}"><i class="bi bi-pencil"></i></a>
                <button class="btn btn-sm btn-outline-danger" type="button" onclick="deleteAdminProd(${p.id})"><i class="bi bi-trash"></i></button>
            </td>
        </tr>`).join('');
    },

    adminCategorias() {
        const db = getDB();
        const editId = Number(new URLSearchParams(window.location.search).get('editar'));
        const editItem = editId ? db.categorias.find(c => c.id === editId) : null;

        document.getElementById('cat-form-title').textContent = (editItem ? 'Editar' : 'Agregar') + ' categoria';
        if (editItem) {
            document.getElementById('cat-id').value = editItem.id;
            document.getElementById('cat-nombre').value = editItem.nombre;
            document.getElementById('cat-desc').value = editItem.descripcion || '';
            document.getElementById('cat-estado').checked = editItem.estado === 1;
        }

        document.getElementById('admin-cat-form').addEventListener('submit', e => {
            e.preventDefault();
            const db2 = getDB();
            const id = Number(document.getElementById('cat-id').value);
            const nombre = document.getElementById('cat-nombre').value.trim();
            const descripcion = document.getElementById('cat-desc').value.trim();
            const estado = document.getElementById('cat-estado').checked ? 1 : 0;
            if (id > 0) {
                const c = db2.categorias.find(x => x.id === id);
                if (c) Object.assign(c, { nombre, descripcion, estado });
            } else {
                const nextId = db2.categorias.reduce((m, c) => Math.max(m, c.id), 0) + 1;
                db2.categorias.push({ id: nextId, nombre, descripcion, estado });
            }
            saveDB(db2);
            setFlash('success', 'Categoria guardada.');
            window.location.href = 'categorias.html';
        });

        document.getElementById('admin-cat-tbody').innerHTML = [...db.categorias].sort((a, b) => a.nombre.localeCompare(b.nombre)).map(c => `
        <tr>
            <td>${esc(c.nombre)}</td>
            <td>${esc(c.descripcion)}</td>
            <td>${c.estado ? 'Activa' : 'Oculta'}</td>
            <td class="text-end"><a class="btn btn-sm btn-outline-primary" href="categorias.html?editar=${c.id}"><i class="bi bi-pencil"></i></a></td>
        </tr>`).join('');
    },

    adminPedidos() {
        const db = getDB();
        const estados = ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'];
        window.updateOrderStatus = function(id) {
            const db2 = getDB();
            const p = db2.pedidos.find(x => x.id === id);
            if (p) {
                p.estado = document.getElementById('est-' + id).value;
                saveDB(db2);
                setFlash('success', 'Estado del pedido actualizado.');
                window.location.reload();
            }
        };

        document.getElementById('admin-orders-tbody').innerHTML = db.pedidos.length ? db.pedidos.map(p => {
            const u = db.usuarios.find(x => x.id === p.usuario_id);
            return `
            <tr>
                <td>#${p.id}</td>
                <td>${esc(u ? u.nombre : 'Cliente')}<br><span class="small text-muted">${esc(u ? u.correo : '')}</span></td>
                <td>Bs ${fmtMoney(p.total)}</td>
                <td>${esc(p.direccion_envio)}</td>
                <td>
                    <div class="d-flex gap-2">
                        <select id="est-${p.id}" class="form-select form-select-sm">
                            ${estados.map(st => `<option value="${st}" ${p.estado === st ? 'selected' : ''}>${st}</option>`).join('')}
                        </select>
                        <button class="btn btn-sm btn-primary" type="button" onclick="updateOrderStatus(${p.id})"><i class="bi bi-check2"></i></button>
                    </div>
                </td>
                <td>${esc(p.creado_en)}</td>
                <td><a class="btn btn-sm btn-outline-dark" href="../pedidos.html">Vista cliente</a></td>
            </tr>`;
        }).join('') : `<tr><td colspan="7" class="text-center text-muted">Aun no hay pedidos realizados.</td></tr>`;
    },

    adminUsuarios() {
        const db = getDB();
        document.getElementById('admin-users-tbody').innerHTML = db.usuarios.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${esc(u.nombre)}</td>
            <td>${esc(u.correo)}</td>
            <td>${esc(u.telefono || '')}</td>
            <td>${esc(u.direccion || '')}</td>
            <td><span class="badge bg-dark">${esc(u.rol)}</span></td>
            <td>${esc(u.creado_en)}</td>
        </tr>`).join('');
    }
};