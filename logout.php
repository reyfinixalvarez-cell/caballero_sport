<?php
require_once 'includes/functions.php';
session_destroy();
session_start();
$_SESSION['flash'] = ['type' => 'success', 'message' => 'Sesion cerrada correctamente.'];
redirect('index.php');
?>
