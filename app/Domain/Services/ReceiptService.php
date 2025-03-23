<?php

namespace App\Domain\Services;

use App\Domain\Models\Receipt;
use App\Domain\Repositories\Interfaces\ReceiptRepositoryInterface;
use App\Domain\Repositories\Interfaces\TransactionRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReceiptService
{
    protected ReceiptRepositoryInterface $receiptRepository;
    protected TransactionRepositoryInterface $transactionRepository;

    public function __construct(
        ReceiptRepositoryInterface $receiptRepository,
        TransactionRepositoryInterface $transactionRepository
    ) {
        $this->receiptRepository = $receiptRepository;
        $this->transactionRepository = $transactionRepository;
    }

    public function uploadReceipt(int $userId, UploadedFile $file): Receipt
    {
        // Store the receipt image
        $path = $this->storeReceiptImage($file);

        // Create receipt record
        $receipt = $this->receiptRepository->create([
            'user_id' => $userId,
            'image_path' => $path,
            'status' => 'pending',
            'purchase_date' => now(),
            'total_amount' => 0, // Will be updated after OCR processing
        ]);

        // Dispatch OCR processing job
        // TODO: Implement OCR job dispatch
        // ProcessReceiptOcr::dispatch($receipt);

        return $receipt;
    }

    public function processOcrResult(Receipt $receipt, array $ocrData): Receipt
    {
        // Extract relevant information from OCR data
        $extractedData = $this->extractDataFromOcr($ocrData);

        // Update receipt with extracted data
        $receipt = $this->receiptRepository->update([
            'merchant_name' => $extractedData['merchant_name'],
            'total_amount' => $extractedData['total_amount'],
            'purchase_date' => $extractedData['purchase_date'],
            'ocr_data' => $ocrData,
            'status' => 'completed'
        ], $receipt->id);

        // Create transaction from receipt
        if ($extractedData['total_amount'] > 0) {
            $this->transactionRepository->create([
                'user_id' => $receipt->user_id,
                'receipt_id' => $receipt->id,
                'description' => "Purchase at {$extractedData['merchant_name']}",
                'amount' => $extractedData['total_amount'],
                'transaction_date' => $extractedData['purchase_date'],
            ]);
        }

        return $receipt;
    }

    public function getReceiptDetails(int $receiptId): array
    {
        $receipt = $this->receiptRepository->findOrFail($receiptId);
        $transactions = $this->transactionRepository->findByReceipt($receiptId);

        return [
            'receipt' => $receipt,
            'transactions' => $transactions,
            'image_url' => Storage::url($receipt->image_path),
        ];
    }

    protected function storeReceiptImage(UploadedFile $file): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('receipts', $filename, 'public');
        
        return $path;
    }

    protected function extractDataFromOcr(array $ocrData): array
    {
        // TODO: Implement sophisticated OCR data extraction logic
        return [
            'merchant_name' => $ocrData['merchant_name'] ?? 'Unknown Merchant',
            'total_amount' => $ocrData['total_amount'] ?? 0,
            'purchase_date' => $ocrData['purchase_date'] ?? now(),
        ];
    }

    public function updateReceipt(int $receiptId, array $data): Receipt
    {
        $receipt = $this->receiptRepository->findOrFail($receiptId);

        // Handle image update if provided
        if (isset($data['image'])) {
            // Delete old image
            if ($receipt->image_path) {
                Storage::disk('public')->delete($receipt->image_path);
            }
            
            // Store new image
            $data['image_path'] = $this->storeReceiptImage($data['image']);
            unset($data['image']);
        }

        return $this->receiptRepository->update($data, $receiptId);
    }

    public function deleteReceipt(int $receiptId): bool
    {
        $receipt = $this->receiptRepository->findOrFail($receiptId);
        
        // Delete associated image
        Storage::disk('public')->delete($receipt->image_path);
        
        // Delete receipt (and associated transactions through cascade)
        return $this->receiptRepository->delete($receiptId);
    }
}
