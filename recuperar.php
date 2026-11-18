<?php
$pageTitle = 'Recuperar contrasena';
require_once 'includes/header.php';
$token = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo = trim($_POST['correo'] ?? '');
    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = ?');
    $stmt->execute([$correo]);
    $usuario = $stmt->fetch();
    if ($usuario) {
        // Simulacion: se genera un token que en un sistema real se enviaria por correo.
        $token = bin2hex(random_bytes(16));
        $upd = $pdo->prepare('UPDATE usuarios SET token_recuperacion = ? WHERE id = ?');
        $upd->execute([$token, $usuario['id']]);
        $_SESSION['flash'] = ['type' => 'success', 'message' => 'Token generado para recuperar la cuenta.'];
    } else {
        $_SESSION['flash'] = ['type' => 'warning', 'message' => 'Si el correo existe, se generara un token.'];
    }
}
?>
<section class="auth-section">
    <div class="auth-card">
        <h1>Recuperar contrasena</h1>
        <form method="post">
            <div class="mb-3">
                <label class="form-label">Correo registrado</label>
                <input type="email" name="correo" class="form-control" required>
            </div>
            <button class="btn btn-primary w-100" type="submit">Generar token</button>
        </form>
        <?php if ($token): ?>
            <div class="alert alert-info mt-3">Token de recuperacion simulado: <strong><?= e($token) ?></strong></div>
            <a class="btn btn-outline-primary w-100" href="restablecer.php?token=<?= e($token) ?>">Restablecer contrasena</a>
        <?php endif; ?>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
