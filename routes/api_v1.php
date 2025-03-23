<?php

use App\Http\Controllers\Api\V1\Auth\{
    AuthController,
    PasswordResetController
};
use App\Http\Controllers\Api\V1\{
    CategoryController,
    ReceiptController,
    TransactionController
};
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [PasswordResetController::class, 'sendResetLink']);
    Route::post('reset-password', [PasswordResetController::class, 'reset']);
});

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });

    // Receipt routes
    Route::prefix('receipts')->group(function () {
        Route::get('/', [ReceiptController::class, 'index']);
        Route::post('/', [ReceiptController::class, 'store']);
        Route::get('{receipt}', [ReceiptController::class, 'show']);
        Route::post('{receipt}', [ReceiptController::class, 'update']);
        Route::delete('{receipt}', [ReceiptController::class, 'destroy']);
        Route::get('{receipt}/transactions', [ReceiptController::class, 'transactions']);
        Route::post('{receipt}/process', [ReceiptController::class, 'processOcr'])
            ->middleware('throttle:ocr');
    });

    // Transaction routes
    Route::prefix('transactions')->group(function () {
        Route::get('/', [TransactionController::class, 'index']);
        Route::post('/', [TransactionController::class, 'store']);
        Route::get('{transaction}', [TransactionController::class, 'show']);
        Route::put('{transaction}', [TransactionController::class, 'update']);
        Route::delete('{transaction}', [TransactionController::class, 'destroy']);
        Route::post('bulk/categorize', [TransactionController::class, 'bulkCategorize']);
        Route::get('stats/monthly', [TransactionController::class, 'monthlyStats']);
        Route::get('stats/category', [TransactionController::class, 'categoryStats']);
        Route::get('tax-report/{year}', [TransactionController::class, 'taxReport']);
    });

    // Category routes
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::post('/', [CategoryController::class, 'store']);
        Route::get('{category}', [CategoryController::class, 'show']);
        Route::put('{category}', [CategoryController::class, 'update']);
        Route::delete('{category}', [CategoryController::class, 'destroy']);
        Route::get('{category}/transactions', [CategoryController::class, 'transactions']);
        Route::get('{category}/stats', [CategoryController::class, 'stats']);
        Route::post('{category}/merge/{targetCategory}', [CategoryController::class, 'merge']);
    });
});

// Rate limiting for public endpoints
Route::middleware('throttle:auth')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
});

// Rate limiting for file uploads
Route::middleware(['auth:api', 'throttle:uploads'])->group(function () {
    Route::post('receipts', [ReceiptController::class, 'store']);
});
