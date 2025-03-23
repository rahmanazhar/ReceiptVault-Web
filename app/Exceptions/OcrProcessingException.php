<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class OcrProcessingException extends BaseException
{
    public function __construct(
        string $message = 'OCR processing failed',
        array $errors = [],
        ?string $receiptId = null,
        int $code = Response::HTTP_UNPROCESSABLE_ENTITY,
        ?Exception $previous = null
    ) {
        $context = [
            'receipt_id' => $receiptId,
            'errors' => $errors,
        ];

        parent::__construct(
            $message,
            $context,
            'ocr_processing_error',
            'OCR_FAILED',
            $code,
            $previous
        );
    }

    public static function invalidImage(string $receiptId, array $errors = []): self
    {
        return new static(
            'Invalid or unprocessable receipt image',
            $errors,
            $receiptId,
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function extractionFailed(string $receiptId, array $errors = []): self
    {
        return new static(
            'Failed to extract data from receipt image',
            $errors,
            $receiptId,
            Response::HTTP_INTERNAL_SERVER_ERROR
        );
    }

    public static function serviceUnavailable(string $receiptId, string $service): self
    {
        return new static(
            "OCR service '{$service}' is currently unavailable",
            ['service' => $service],
            $receiptId,
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }

    public static function processingTimeout(string $receiptId): self
    {
        return new static(
            'OCR processing timed out',
            ['timeout' => config('services.ocr.timeout')],
            $receiptId,
            Response::HTTP_GATEWAY_TIMEOUT
        );
    }
}
