<?php

namespace App\Jobs;

use App\Domain\Models\Document;
use App\Domain\Services\AbacusAiService;
use App\Events\DocumentProcessed;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessDocumentWithAi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        private int $documentId,
    ) {}

    public function handle(AbacusAiService $aiService): void
    {
        $document = Document::find($this->documentId);
        if (!$document) {
            return;
        }

        $document->update(['status' => 'processing']);

        try {
            $result = $aiService->analyzeDocument($document->image_path);

            $document->update([
                'document_type' => $result->documentType ?? $document->document_type,
                'title' => $result->title ?? $document->title,
                'sender' => $result->sender ?? $document->sender,
                'recipient' => $result->recipient ?? $document->recipient,
                'reference_number' => $result->referenceNumber ?? $document->reference_number,
                'issue_date' => $result->issueDate ?? $document->issue_date,
                'expiry_date' => $result->expiryDate ?? $document->expiry_date,
                'description' => $result->description ?? $document->description,
                'ocr_data' => $result->toArray(),
                'ai_confidence_score' => $result->confidenceScore,
                'ai_raw_response' => $result->rawResponse,
                'additional_fields' => !empty($result->additionalFields) ? $result->additionalFields : null,
                'metadata' => $result->metadata,
                'status' => 'review_needed',
            ]);

            event(new DocumentProcessed($document));

            Log::info("Document {$this->documentId} processed successfully", [
                'confidence' => $result->confidenceScore,
                'type' => $result->documentType,
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to process document {$this->documentId}: {$e->getMessage()}");

            $document->update([
                'status' => 'failed',
                'ai_raw_response' => ['error' => $e->getMessage()],
            ]);

            if ($this->attempts() >= $this->tries) {
                return;
            }

            throw $e;
        }
    }
}
