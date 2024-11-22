<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Simula um banco de dados
$data = [
    'items' => [
        ['id' => 1, 'name' => 'Item 1', 'value' => 100],
        ['id' => 2, 'name' => 'Item 2', 'value' => 200],
    ]
];

// Router básico
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Log da requisição
error_log("Request: $method $path");

try {
    switch ($method) {
        case 'GET':
            if ($path === '/api/items') {
                echo json_encode([
                    'success' => true,
                    'data' => $data['items']
                ]);
            } elseif (preg_match('/\/api\/items\/(\d+)/', $path, $matches)) {
                $id = (int)$matches[1];
                $item = array_filter($data['items'], fn($i) => $i['id'] === $id);
                if ($item) {
                    echo json_encode([
                        'success' => true,
                        'data' => current($item)
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Item not found']);
                }
            }
            break;

        case 'POST':
            if ($path === '/api/items') {
                $input = json_decode(file_get_contents('php://input'), true);
                $newItem = [
                    'id' => count($data['items']) + 1,
                    'name' => $input['name'],
                    'value' => $input['value']
                ];
                $data['items'][] = $newItem;
                echo json_encode([
                    'success' => true,
                    'data' => $newItem
                ]);
            }
            break;

        case 'OPTIONS':
            http_response_code(200);
            break;

        default:
            throw new Exception('Method not supported');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
