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
        public ?array $currencyConversion = null,
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

        $currencyConversion = null;
        if (isset($parsed['currency_conversion']) && is_array($parsed['currency_conversion'])) {
            $currencyConversion = $parsed['currency_conversion'];
        }

        $totalAmount = isset($parsed['total_amount']) ? (float) $parsed['total_amount'] : null;
        $taxAmount = isset($parsed['tax_amount']) ? (float) $parsed['tax_amount'] : null;
        $subtotalAmount = isset($parsed['subtotal_amount']) ? (float) $parsed['subtotal_amount'] : null;

        // Safety net: if AI detected a foreign currency but forgot to convert the amounts,
        // apply the conversion ourselves using the exchange rate it provided.
        if ($currencyConversion && !empty($currencyConversion['exchange_rate'])) {
            $rate = (float) $currencyConversion['exchange_rate'];
            $origTotal = (float) ($currencyConversion['original_total_amount'] ?? 0);

            // If total_amount matches the original amount, the AI didn't convert — do it here
            if ($totalAmount && $origTotal > 0 && abs($totalAmount - $origTotal) < 0.02) {
                $totalAmount = round($totalAmount * $rate, 2);
                $taxAmount = $taxAmount ? round($taxAmount * $rate, 2) : null;
                $subtotalAmount = $subtotalAmount ? round($subtotalAmount * $rate, 2) : null;
            }
        }

        return new self(
            merchantName: $parsed['merchant_name'] ?? null,
            totalAmount: $totalAmount,
            taxAmount: $taxAmount,
            subtotalAmount: $subtotalAmount,
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
            currencyConversion: $currencyConversion,
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
            'currency_conversion' => $this->currencyConversion,
        ];
    }
}
