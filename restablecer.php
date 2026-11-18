<?php
$pageTitle = 'Restablecer contrasena';
require_once 'includes/header.php';

$token = $_GET['token'] ?? ($_POST['token'] ?? '');
$stmt = $pdo->prepare('SELECT id, correo FROM usuarios WHERE token_recuperacion = ?');
$stmt->execute([$token]);
$usuario = $stmt->fetch();

if (!$usuario) {
    $_SESSION['flash'] = ['type' => 'error', 'message' => 'Token invalido o vencido.'];
    redirect('recuperar.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['contrasena'] ?? '';
    if (strlen($password) < 6) {
        $_SESSION['flash'] = ['type' => 'error', 'message' => 'La contrasena debe tener al menos 6 caracteres.'];
    } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $upd = $pdo->prepare('UPDATE usuarios SET contrasena = ?, token_recuperacion = NULL WHERE id = ?');
        $upd->execute([$hash, $usuario['id']]);
        $_SESSION['flash'] = ['type' => 'success', 'message' => 'Contrasena actualizada. Inicia sesion.'];
        redirect('login.php');
    }
}
?>
<section class="auth-section">
    <div class="auth-card">
        <h1>Restablecer contrasena</h1>
        <p class="text-muted">Cuenta: <?= e($usuario['correo']) ?></p>
        <form method="post" class="needs-validation" novalidate>
            <input type="hidden" name="token" value="<?= e($token) ?>">
            <div class="mb-3">
                <label class="form-label">Nueva contrasena</label>
                <input type="password" name="contrasena" class="form-control" minlength="6" required>
            </div>
            <button class="btn btn-primary w-100" type="submit">Guardar nueva contrasena</button>
        </form>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
