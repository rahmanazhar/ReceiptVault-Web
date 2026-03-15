<?php

namespace App\Jobs;

use App\Domain\Models\Receipt;
use App\Domain\Models\Transaction;
use App\Domain\Services\AbacusAiService;
use App\Events\ReceiptProcessed;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessReceiptWithAi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        private int $receiptId,
    ) {}

    public function handle(AbacusAiService $aiService): void
    {
        $receipt = Receipt::find($this->receiptId);
        if (!$receipt || $receipt->status === 'completed') {
            return;
        }

        $receipt->update(['status' => 'processing']);

        try {
            $result = $aiService->analyzeReceipt($receipt->image_path);

            // Update receipt with extracted data
            $receipt->update([
                'merchant_name' => $result->merchantName ?? $receipt->merchant_name,
                'total_amount' => $result->totalAmount ?? $receipt->total_amount,
                'tax_amount' => $result->taxAmount,
                'subtotal_amount' => $result->subtotalAmount,
                'currency' => $result->currency ?? 'MYR',
                'purchase_date' => $result->purchaseDate ?? $receipt->purchase_date,
                'receipt_number' => $result->receiptNumber,
                'payment_method' => $result->paymentMethod,
                'ocr_data' => $result->toArray(),
                'ai_confidence_score' => $result->confidenceScore,
                'ai_raw_response' => $result->rawResponse,
                'additional_fields' => !empty($result->additionalFields) ? $result->additionalFields : null,
                'status' => 'review_needed',
            ]);

            // Auto-create a transaction from the receipt
            if ($result->totalAmount) {
                Transaction::create([
                    'user_id' => $receipt->user_id,
                    'receipt_id' => $receipt->id,
                    'description' => $result->merchantName ?? 'Receipt #' . $receipt->id,
                    'amount' => $result->totalAmount,
                    'currency' => $result->currency ?? 'MYR',
                    'transaction_date' => $result->purchaseDate ?? $receipt->created_at->toDateString(),
                    'is_tax_deductible' => !empty($result->suggestedLhdnCategory),
                    'lhdn_category_code' => $result->suggestedLhdnCategory,
                    'tax_relief_amount' => !empty($result->suggestedLhdnCategory) ? $result->totalAmount : null,
                    'tax_year' => $result->purchaseDate
                        ? (int) date('Y', strtotime($result->purchaseDate))
                        : (int) date('Y'),
                ]);
            }

            event(new ReceiptProcessed($receipt));

            Log::info("Receipt {$this->receiptId} processed successfully", [
                'confidence' => $result->confidenceScore,
                'merchant' => $result->merchantName,
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to process receipt {$this->receiptId}: {$e->getMessage()}");

            $receipt->update([
                'status' => 'failed',
                'ai_raw_response' => ['error' => $e->getMessage()],
            ]);

            if ($this->attempts() >= $this->tries) {
                // Final failure - keep as failed status
                return;
            }

            throw $e; // Re-throw to trigger retry
        }
    }
}
