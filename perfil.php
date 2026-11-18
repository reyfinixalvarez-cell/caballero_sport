<?php
$pageTitle = 'Editar perfil';
require_once 'includes/header.php';
requireLogin();
$user = currentUser();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $direccion = trim($_POST['direccion'] ?? '');
    $nueva = $_POST['nueva_contrasena'] ?? '';

    if ($nombre === '') {
        $_SESSION['flash'] = ['type' => 'error', 'message' => 'El nombre es obligatorio.'];
    } else {
        if ($nueva !== '') {
            if (strlen($nueva) < 6) {
                $_SESSION['flash'] = ['type' => 'error', 'message' => 'La nueva contrasena debe tener al menos 6 caracteres.'];
                redirect('perfil.php');
            }
            $hash = password_hash($nueva, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ?, contrasena = ? WHERE id = ?');
            $stmt->execute([$nombre, $telefono, $direccion, $hash, $user['id']]);
        } else {
            $stmt = $pdo->prepare('UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?');
            $stmt->execute([$nombre, $telefono, $direccion, $user['id']]);
        }
        $_SESSION['flash'] = ['type' => 'success', 'message' => 'Perfil actualizado.'];
        redirect('perfil.php');
    }
}
?>
<section class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-7">
            <div class="content-panel">
                <h1>Editar perfil</h1>
                <form method="post" class="needs-validation" novalidate>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">Nombre</label>
                            <input type="text" name="nombre" class="form-control" value="<?= e($user['nombre']) ?>" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Correo</label>
                            <input type="email" class="form-control" value="<?= e($user['correo']) ?>" disabled>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Telefono</label>
                            <input type="text" name="telefono" class="form-control" value="<?= e($user['telefono']) ?>">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Nueva contrasena</label>
                            <input type="password" name="nueva_contrasena" class="form-control" minlength="6">
                        </div>
                        <div class="col-12">
                            <label class="form-label">Direccion</label>
                            <input type="text" name="direccion" class="form-control" value="<?= e($user['direccion']) ?>">
                        </div>
                    </div>
                    <button class="btn btn-primary mt-4" type="submit">Guardar cambios</button>
                </form>
            </div>
        </div>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
