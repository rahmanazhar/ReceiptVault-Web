<?php

namespace App\Domain\DTOs;

class ReceiptExtractionResult
{
    public function __construct(
        public ?string $merchantName = null,
        public ?float $totalAmount = null,
        public ?float $taxAmount = null,
        public ?float $subtotalAmount = null,
        public ?string $currency = 'MYR',
        public ?string $purchaseDate = null,
        public ?string $receiptNumber = null,
        public ?string $paymentMethod = null,
        public array $lineItems = [],
        public array $additionalFields = [],
        public float $confidenceScore = 0.0,
        public array $rawResponse = [],
        public ?string $suggestedLhdnCategory = null,
        public ?array $metadata = null,
    ) {}

    public static function fromAiResponse(array $parsed, array $rawResponse): self
    {
        $fieldsExtracted = 0;
        $totalFields = 7; // merchant, total, tax, date, receipt#, payment, subtotal

        if (!empty($parsed['merchant_name'])) $fieldsExtracted++;
        if (!empty($parsed['total_amount'])) $fieldsExtracted++;
        if (!empty($parsed['tax_amount'])) $fieldsExtracted++;
        if (!empty($parsed['purchase_date'])) $fieldsExtracted++;
        if (!empty($parsed['receipt_number'])) $fieldsExtracted++;
        if (!empty($parsed['payment_method'])) $fieldsExtracted++;
        if (!empty($parsed['subtotal_amount'])) $fieldsExtracted++;

        return new self(
            merchantName: $parsed['merchant_name'] ?? null,
            totalAmount: isset($parsed['total_amount']) ? (float) $parsed['total_amount'] : null,
            taxAmount: isset($parsed['tax_amount']) ? (float) $parsed['tax_amount'] : null,
            subtotalAmount: isset($parsed['subtotal_amount']) ? (float) $parsed['subtotal_amount'] : null,
            currency: $parsed['currency'] ?? 'MYR',
            purchaseDate: $parsed['purchase_date'] ?? null,
            receiptNumber: $parsed['receipt_number'] ?? null,
            paymentMethod: $parsed['payment_method'] ?? null,
            lineItems: $parsed['line_items'] ?? [],
            additionalFields: $parsed['additional_fields'] ?? [],
            confidenceScore: $fieldsExtracted / $totalFields,
            rawResponse: $rawResponse,
            suggestedLhdnCategory: $parsed['suggested_lhdn_category'] ?? null,
            metadata: isset($parsed['metadata']) && is_array($parsed['metadata']) ? $parsed['metadata'] : null,
        );
    }

    public function toArray(): array
    {
        return [
            'merchant_name' => $this->merchantName,
            'total_amount' => $this->totalAmount,
            'tax_amount' => $this->taxAmount,
            'subtotal_amount' => $this->subtotalAmount,
            'currency' => $this->currency,
            'purchase_date' => $this->purchaseDate,
            'receipt_number' => $this->receiptNumber,
            'payment_method' => $this->paymentMethod,
            'line_items' => $this->lineItems,
            'additional_fields' => $this->additionalFields,
            'confidence_score' => $this->confidenceScore,
            'suggested_lhdn_category' => $this->suggestedLhdnCategory,
            'metadata' => $this->metadata,
        ];
    }
}
