<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json'); 

require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';
require 'phpmailer/Exception.php';

require 'env.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        throw new Exception("Datos JSON no recibidos o inválidos.");
    }

    // CAMPOS REQUERIDOS NORMALES
    $campos_requeridos = ['nombre', 'email', 'calle', 'tel', 'postal', 'muni', 'carrito'];
    foreach ($campos_requeridos as $campo) {
        if (empty($data[$campo])) {
            throw new Exception("Falta el campo requerido: $campo");
        }
    }

    // 📌 *** PDF ES OPCIONAL, PERO SI VIENE SE ENVÍA ***
    $pdfAdjunto = null;
    if (!empty($data['pdfBase64'])) {
        $pdfData = base64_decode($data['pdfBase64']);
        if ($pdfData === false) {
            throw new Exception("El PDF recibido está corrupto o mal codificado.");
        }

        // Guardar PDF temporalmente
        $pdfAdjunto = "pedido_" . time() . ".pdf";
        file_put_contents($pdfAdjunto, $pdfData);
    }

    // Obtener IP / ubicación
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'No disponible';
    $locationData = @file_get_contents("https://ipinfo.io/{$ip}/json");
    $location = json_decode($locationData, true);

    $city = $location['city'] ?? 'Desconocida';
    $region = $location['region'] ?? 'Desconocida';
    $country = $location['country'] ?? 'Desconocido';

    $horaActual = date('Y-m-d H:i:s');

    // Guardar pedido TXT
    $file = 'orders.txt';
    $totalCarrito = 0;

    $orderData = "Nombre: {$data['nombre']}\n";
    $orderData .= "Correo: {$data['email']}\n";
    $orderData .= "Tel: {$data['tel']}\n";
    $orderData .= "CP: {$data['postal']}\n";
    $orderData .= "Municipio: {$data['muni']}\n";
    $orderData .= "Calle: {$data['calle']}\n";
    $orderData .= "IP: $ip\n";
    $orderData .= "Ubicación: $city, $region, $country\n";
    $orderData .= "Hora: $horaActual\n";
    $orderData .= "Carrito:\n";

    foreach ($data['carrito'] as $item) {
        $orderData .= " - {$item['nombre']} - $" . number_format($item['precio'], 2) . "\n";
        $totalCarrito += $item['precio'];
    }

    $orderData .= "Total: $" . number_format($totalCarrito, 2) . "\n";
    $orderData .= "-----------------------------\n\n";

    file_put_contents($file, $orderData, FILE_APPEND);

    // ------------ ENVÍO DE CORREO -------------- //

    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host = 'smtp.zoho.eu';
    $mail->SMTPAuth = true;
    $mail->Username = getenv('ZOHO_USER');
    $mail->Password = getenv('ZOHO_PASS');
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom(getenv('ZOHO_USER'), 'Formulario Web');
    $mail->addAddress(getenv('ZOHO_USER'));

    $mail->isHTML(true);
    $mail->Subject = 'Nuevo pedido desde el checkout';

    $body = "<h2>Nuevo pedido recibido</h2>";
    foreach (['nombre','email','tel','calle','muni','postal'] as $campo) {
        $body .= "<p><strong>$campo:</strong> " . htmlspecialchars($data[$campo]) . "</p>";
    }
    $body .= "<p><strong>IP:</strong> $ip</p>";
    $body .= "<p><strong>Ubicación:</strong> $city, $region, $country</p>";
    $body .= "<p><strong>Hora:</strong> $horaActual</p>";

    $body .= "<h3>Carrito:</h3><ul>";
    foreach ($data['carrito'] as $item) {
        $body .= "<li>" . htmlspecialchars($item['nombre']) . " - $" . number_format($item['precio'], 2) . "</li>";
    }
    $body .= "</ul>";

    $body .= "<p><strong>Total:</strong> $" . number_format($totalCarrito, 2) . "</p>";

    $mail->Body = $body;

    // 📌 **Adjuntar PDF si existe**
    if ($pdfAdjunto) {
        $mail->addAttachment($pdfAdjunto);
    }

    $mail->send();

    // Eliminar temporal si existe
    if ($pdfAdjunto && file_exists($pdfAdjunto)) {
        unlink($pdfAdjunto);
    }

    echo json_encode([
        "success" => true,
        "message" => "Pedido procesado, PDF enviado y correo enviado.",
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
