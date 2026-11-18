<?php
$pageTitle = 'Registro';
require_once 'includes/header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $correo = trim($_POST['correo'] ?? '');
    $password = $_POST['contrasena'] ?? '';
    $telefono = trim($_POST['telefono'] ?? '');
    $direccion = trim($_POST['direccion'] ?? '');

    if ($nombre === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) {
        $_SESSION['flash'] = ['type' => 'error', 'message' => 'Completa los datos correctamente. La contrasena debe tener al menos 6 caracteres.'];
    } else {
        $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = ?');
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            $_SESSION['flash'] = ['type' => 'warning', 'message' => 'Ese correo ya esta registrado.'];
        } else {
            // password_hash cifra la contrasena antes de guardarla.
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('INSERT INTO usuarios (nombre, correo, contrasena, telefono, direccion) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$nombre, $correo, $hash, $telefono, $direccion]);
            $_SESSION['flash'] = ['type' => 'success', 'message' => 'Cuenta creada. Ahora inicia sesion.'];
            redirect('login.php');
        }
    }
}
?>
<section class="auth-section">
    <div class="auth-card">
        <h1>Crear cuenta</h1>
        <form method="post" class="needs-validation" novalidate>
            <div class="mb-3">
                <label class="form-label">Nombre completo</label>
                <input type="text" name="nombre" class="form-control" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Correo</label>
                <input type="email" name="correo" class="form-control" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Contrasena</label>
                <input type="password" name="contrasena" class="form-control" minlength="6" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Telefono</label>
                <input type="text" name="telefono" class="form-control">
            </div>
            <div class="mb-3">
                <label class="form-label">Direccion</label>
                <input type="text" name="direccion" class="form-control">
            </div>
            <button class="btn btn-primary w-100" type="submit">Registrarse</button>
        </form>
        <p class="text-center mt-3 mb-0">Ya tienes cuenta? <a href="login.php">Inicia sesion</a></p>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
