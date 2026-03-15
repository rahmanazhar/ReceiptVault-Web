<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\Auth\LoginController;
use App\Http\Controllers\Web\Auth\RegisterController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\ReceiptWebController;
use App\Http\Controllers\Web\MedicalCertificateWebController;
use App\Http\Controllers\Web\TransactionWebController;
use App\Http\Controllers\Web\TaxController;
use App\Http\Controllers\Web\SettingsController;

/*
|--------------------------------------------------------------------------
| Guest Routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/', fn () => redirect('/login'));
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Receipts
    Route::get('/receipts', [ReceiptWebController::class, 'index'])->name('receipts.index');
    Route::get('/receipts/create', [ReceiptWebController::class, 'create'])->name('receipts.create');
    Route::post('/receipts', [ReceiptWebController::class, 'store'])->name('receipts.store');
    Route::get('/receipts/{receipt}', [ReceiptWebController::class, 'show'])->name('receipts.show');
    Route::put('/receipts/{receipt}', [ReceiptWebController::class, 'update'])->name('receipts.update');
    Route::delete('/receipts/{receipt}', [ReceiptWebController::class, 'destroy'])->name('receipts.destroy');
    Route::post('/receipts/{receipt}/rotate', [ReceiptWebController::class, 'rotate'])->name('receipts.rotate');
    Route::post('/receipts/{receipt}/recrop', [ReceiptWebController::class, 'recrop'])->name('receipts.recrop');
    Route::post('/receipts/{receipt}/retry-ai', [ReceiptWebController::class, 'retryAi'])->name('receipts.retryAi');
    Route::get('/receipts/{receipt}/download', [ReceiptWebController::class, 'download'])->name('receipts.download');

    // Medical Certificates
    Route::get('/medical-certificates', [MedicalCertificateWebController::class, 'index'])->name('medical-certificates.index');
    Route::get('/medical-certificates/create', [MedicalCertificateWebController::class, 'create'])->name('medical-certificates.create');
    Route::post('/medical-certificates', [MedicalCertificateWebController::class, 'store'])->name('medical-certificates.store');
    Route::get('/medical-certificates/{medical_certificate}', [MedicalCertificateWebController::class, 'show'])->name('medical-certificates.show');
    Route::put('/medical-certificates/{medical_certificate}', [MedicalCertificateWebController::class, 'update'])->name('medical-certificates.update');
    Route::delete('/medical-certificates/{medical_certificate}', [MedicalCertificateWebController::class, 'destroy'])->name('medical-certificates.destroy');
    Route::post('/medical-certificates/{medical_certificate}/rotate', [MedicalCertificateWebController::class, 'rotate'])->name('medical-certificates.rotate');
    Route::post('/medical-certificates/{medical_certificate}/recrop', [MedicalCertificateWebController::class, 'recrop'])->name('medical-certificates.recrop');
    Route::post('/medical-certificates/{medical_certificate}/retry-ai', [MedicalCertificateWebController::class, 'retryAi'])->name('medical-certificates.retryAi');
    Route::get('/medical-certificates/{medical_certificate}/download', [MedicalCertificateWebController::class, 'download'])->name('medical-certificates.download');

    // Transactions
    Route::get('/transactions', [TransactionWebController::class, 'index'])->name('transactions.index');

    // Tax Tracking
    Route::get('/tax', [TaxController::class, 'index'])->name('tax.index');
    Route::get('/tax/report/{year}', [TaxController::class, 'report'])->name('tax.report');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/profile', [SettingsController::class, 'update'])->name('settings.update');
    Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
});
