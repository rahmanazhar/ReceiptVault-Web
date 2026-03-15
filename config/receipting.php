<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Abacus AI Configuration
    |--------------------------------------------------------------------------
    */
    'abacus_ai' => [
        'api_key' => env('ABACUS_AI_API_KEY'),
        'base_url' => env('ABACUS_AI_BASE_URL', 'https://routellm.abacus.ai/v1'),
        'model' => env('ABACUS_AI_MODEL', 'gpt-5.1'),
        'timeout' => env('ABACUS_AI_TIMEOUT', 60),
        'max_retries' => 3,
    ],

    /*
    |--------------------------------------------------------------------------
    | Currency & Locale
    |--------------------------------------------------------------------------
    */
    'default_currency' => 'MYR',
    'currency_symbol' => 'RM',
    'locale' => 'ms_MY',

    /*
    |--------------------------------------------------------------------------
    | Receipt Processing
    |--------------------------------------------------------------------------
    */
    'receipts' => [
        'max_file_size' => 10240, // KB
        'allowed_mimes' => ['jpeg', 'png', 'jpg', 'pdf'],
        'thumbnail_width' => 400,
        'thumbnail_quality' => 80,
        'max_image_dimension' => 2048,
    ],

    /*
    |--------------------------------------------------------------------------
    | LHDN Tax Configuration
    |--------------------------------------------------------------------------
    */
    'lhdn' => [
        'current_tax_year' => (int) date('Y'),
        'supported_tax_years' => [2024, 2025, 2026],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Methods
    |--------------------------------------------------------------------------
    */
    'payment_methods' => [
        'cash' => 'Cash',
        'credit_card' => 'Credit Card',
        'debit_card' => 'Debit Card',
        'e_wallet' => 'E-Wallet',
        'online_banking' => 'Online Banking',
        'bank_transfer' => 'Bank Transfer',
    ],
];
