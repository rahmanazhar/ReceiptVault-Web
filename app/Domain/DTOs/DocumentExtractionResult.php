<?php

namespace App\Domain\DTOs;

class DocumentExtractionResult
{
    public function __construct(
        public ?string $documentType = null,
        public ?string $title = null,
        public ?string $sender = null,
        public ?string $recipient = null,
        public ?string $referenceNumber = null,
        public ?string $issueDate = null,
        public ?string $expiryDate = null,
        public ?string $description = null,
        public array $additionalFields = [],
        public float $confidenceScore = 0.0,
        public array $rawResponse = [],
        public ?array $metadata = null,
    ) {}

    public static function fromAiResponse(array $parsed, array $rawResponse): self
    {
        $fieldsExtracted = 0;
        $totalFields = 7; // document_type, title, sender, recipient, reference_number, issue_date, description

        if (!empty($parsed['document_type'])) $fieldsExtracted++;
        if (!empty($parsed['title'])) $fieldsExtracted++;
        if (!empty($parsed['sender'])) $fieldsExtracted++;
        if (!empty($parsed['recipient'])) $fieldsExtracted++;
        if (!empty($parsed['reference_number'])) $fieldsExtracted++;
        if (!empty($parsed['issue_date'])) $fieldsExtracted++;
        if (!empty($parsed['description'])) $fieldsExtracted++;

        return new self(
            documentType: $parsed['document_type'] ?? null,
            title: $parsed['title'] ?? null,
            sender: $parsed['sender'] ?? null,
            recipient: $parsed['recipient'] ?? null,
            referenceNumber: $parsed['reference_number'] ?? null,
            issueDate: $parsed['issue_date'] ?? null,
            expiryDate: $parsed['expiry_date'] ?? null,
            description: $parsed['description'] ?? null,
            additionalFields: $parsed['additional_fields'] ?? [],
            confidenceScore: $fieldsExtracted / $totalFields,
            rawResponse: $rawResponse,
            metadata: $parsed['metadata'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'document_type' => $this->documentType,
            'title' => $this->title,
            'sender' => $this->sender,
            'recipient' => $this->recipient,
            'reference_number' => $this->referenceNumber,
            'issue_date' => $this->issueDate,
            'expiry_date' => $this->expiryDate,
            'description' => $this->description,
            'additional_fields' => $this->additionalFields,
            'confidence_score' => $this->confidenceScore,
        ];
    }
}
