<?php
// Archivo: get_ip.php

// Función para obtener la IP real del cliente, incluso si está detrás de un proxy
function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // A veces vienen múltiples IPs separadas por coma
        $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ipList[0]);
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}

// Obtenemos la IP real
$ip = getClientIP();

// Eliminamos los puntos para generar el número de cliente
$numeroCliente = str_replace('.', '', $ip);

// Respondemos en JSON
echo json_encode(['ip' => $numeroCliente]);
?>