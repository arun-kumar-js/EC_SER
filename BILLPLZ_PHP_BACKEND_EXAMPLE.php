<?php
/**
 * Billplz Payment Gateway Backend
 * This file handles the creation of Billplz bills and returns the payment URL
 * 
 * Expected Request Parameters:
 * - accesskey: Your API access key
 * - type: "create-bill"
 * - order_id: Unique order identifier
 * - mobile: Customer mobile number
 * - customer_email: Customer email
 * - customer_name: Customer name
 * - amount: Amount in cents (smallest currency unit)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration - Update these with your actual values
$BILLPLZ_CONFIG = [
    'API_KEY' => 'd43afc10-6e24-41c7-84be-61a9a89c0ba9',
    'COLLECTION_ID' => 'YOUR_COLLECTION_ID_HERE', // ← Update this
    'X_SIGNATURE' => 'YOUR_X_SIGNATURE_KEY_HERE', // ← Update this
    'ENVIRONMENT' => 'sandbox', // Change to 'production' when ready
    'CALLBACK_URL' => 'https://your-domain.com/billplz-callback',
    'REDIRECT_URL' => 'https://your-domain.com/billplz-redirect'
];

// Set API base URL based on environment
$BILLPLZ_API_BASE = $BILLPLZ_CONFIG['ENVIRONMENT'] === 'production' 
    ? 'https://www.billplz.com/api/v3'
    : 'https://www.billplz-sandbox.com/api/v3';

// Validate access key
$accesskey = $_GET['accesskey'] ?? '';
if ($accesskey !== '90336') {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid access key'
    ]);
    exit;
}

// Validate request type
$type = $_GET['type'] ?? '';
if ($type !== 'create-bill') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request type'
    ]);
    exit;
}

// Get and validate required parameters
$orderId = $_GET['order_id'] ?? '';
$mobile = $_GET['mobile'] ?? '';
$customerEmail = $_GET['customer_email'] ?? '';
$customerName = $_GET['customer_name'] ?? '';
$amount = $_GET['amount'] ?? '';

if (empty($orderId) || empty($amount)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameters: order_id and amount are required'
    ]);
    exit;
}

try {
    // Prepare Billplz API request data
    $billData = [
        'collection_id' => $BILLPLZ_CONFIG['COLLECTION_ID'],
        'description' => "Order #{$orderId} - Spider Ekart",
        'email' => $customerEmail ?: 'customer@example.com',
        'name' => $customerName ?: 'Customer',
        'amount' => intval($amount), // Amount in cents
        'callback_url' => $BILLPLZ_CONFIG['CALLBACK_URL'],
        'redirect_url' => $BILLPLZ_CONFIG['REDIRECT_URL'],
        'reference_1_label' => 'Order ID',
        'reference_1' => $orderId,
        'reference_2_label' => 'Mobile',
        'reference_2' => $mobile
    ];

    // Remove empty values
    $billData = array_filter($billData, function($value) {
        return $value !== '' && $value !== null;
    });

    // Make API call to Billplz
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $BILLPLZ_API_BASE . '/bills');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($billData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Basic ' . base64_encode($BILLPLZ_CONFIG['API_KEY'] . ':'),
        'Content-Type: application/x-www-form-urlencoded'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("Billplz API returned HTTP {$httpCode}: {$response}");
    }

    $billplzResponse = json_decode($response, true);
    
    if (!$billplzResponse || !isset($billplzResponse['url'])) {
        throw new Exception("Invalid response from Billplz API: " . $response);
    }

    // Success! Return the Billplz payment URL
    echo json_encode([
        'success' => true,
        'billplz_url' => $billplzResponse['url'],
        'bill_id' => $billplzResponse['id'] ?? null,
        'message' => 'Bill created successfully'
    ]);

} catch (Exception $e) {
    // Log error for debugging
    error_log("Billplz API Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create Billplz bill: ' . $e->getMessage()
    ]);
}
?>
