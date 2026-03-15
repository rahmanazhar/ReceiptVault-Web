<?php

namespace App\Domain\Services;

use App\Domain\DTOs\DocumentExtractionResult;
use App\Domain\DTOs\MedicalCertificateExtractionResult;
use App\Domain\DTOs\ReceiptExtractionResult;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AbacusAiService
{
    private string $apiKey;
    private string $baseUrl;
    private string $model;
    private int $timeout;
    private int $maxRetries;

    public function __construct()
    {
        $this->apiKey = config('receipting.abacus_ai.api_key', '');
        $this->baseUrl = config('receipting.abacus_ai.base_url', 'https://routellm.abacus.ai/v1');
        $this->model = config('receipting.abacus_ai.model', 'gpt-5.1');
        $this->timeout = config('receipting.abacus_ai.timeout', 60);
        $this->maxRetries = config('receipting.abacus_ai.max_retries', 3);
    }

    public function analyzeReceipt(string $imagePath): ReceiptExtractionResult
    {
        $imageContent = Storage::disk('public')->get($imagePath);
        if (!$imageContent) {
            throw new \RuntimeException("Receipt image not found: {$imagePath}");
        }

        $mimeType = Storage::disk('public')->mimeType($imagePath) ?: 'image/jpeg';

        // Convert PDF to JPEG for the vision API (which only accepts images)
        if ($mimeType === 'application/pdf') {
            $imageContent = $this->convertPdfToImage($imageContent);
            $mimeType = 'image/jpeg';
        }

        $base64Image = base64_encode($imageContent);

        $response = $this->callChatCompletion($base64Image, $mimeType);

        $parsed = $this->parseResponse($response);

        return ReceiptExtractionResult::fromAiResponse($parsed, $response);
    }

    /**
     * Convert the first page of a PDF to a JPEG image using Imagick.
     */
    private function convertPdfToImage(string $pdfContent): string
    {
        $imagick = new \Imagick();
        $imagick->setResolution(200, 200);
        $imagick->readImageBlob($pdfContent);
        $imagick->setIteratorIndex(0); // First page only
        $imagick->setImageFormat('jpeg');
        $imagick->setImageCompressionQuality(90);
        // Flatten transparency to white background
        $imagick->setImageBackgroundColor('white');
        $imagick->setImageAlphaChannel(\Imagick::ALPHACHANNEL_REMOVE);
        $imagick = $imagick->mergeImageLayers(\Imagick::LAYERMETHOD_FLATTEN);

        $jpegContent = $imagick->getImageBlob();
        $imagick->clear();
        $imagick->destroy();

        return $jpegContent;
    }

    public function analyzeMedicalCertificate(string $imagePath): MedicalCertificateExtractionResult
    {
        $imageContent = Storage::disk('public')->get($imagePath);
        if (!$imageContent) {
            throw new \RuntimeException("Medical certificate image not found: {$imagePath}");
        }

        $mimeType = Storage::disk('public')->mimeType($imagePath) ?: 'image/jpeg';

        if ($mimeType === 'application/pdf') {
            $imageContent = $this->convertPdfToImage($imageContent);
            $mimeType = 'image/jpeg';
        }

        $base64Image = base64_encode($imageContent);

        $response = $this->callMcChatCompletion($base64Image, $mimeType);

        $parsed = $this->parseResponse($response);

        return MedicalCertificateExtractionResult::fromAiResponse($parsed, $response);
    }

    private function callMcChatCompletion(string $base64Image, string $mimeType): array
    {
        if (empty($this->apiKey)) {
            Log::warning('Abacus AI not configured - missing API key');
            return [];
        }

        $attempt = 0;
        $lastException = null;

        while ($attempt < $this->maxRetries) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->timeout($this->timeout)
                ->post($this->baseUrl . '/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an expert medical document OCR specialist. Analyze medical certificate images and extract structured data. Always return valid JSON.',
                        ],
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => $this->buildMcExtractionPrompt(),
                                ],
                                [
                                    'type' => 'image_url',
                                    'image_url' => [
                                        'url' => "data:{$mimeType};base64,{$base64Image}",
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'temperature' => 0.2,
                    'max_tokens' => 2000,
                    'stream' => false,
                ]);

                if ($response->successful()) {
                    $json = $response->json() ?? [];
                    Log::info('Abacus AI MC response received', [
                        'status' => $response->status(),
                        'model' => $json['model'] ?? 'unknown',
                        'tokens' => $json['usage']['total_tokens'] ?? 0,
                    ]);
                    return $json;
                }

                Log::warning('Abacus AI MC response error', [
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 500),
                    'attempt' => $attempt + 1,
                ]);

            } catch (\Exception $e) {
                $lastException = $e;
                Log::warning("Abacus AI MC attempt " . ($attempt + 1) . " failed: {$e->getMessage()}");
            }

            $attempt++;
            if ($attempt < $this->maxRetries) {
                sleep(min(pow(2, $attempt), 8));
            }
        }

        if ($lastException) {
            throw $lastException;
        }

        return [];
    }

    private function buildMcExtractionPrompt(): string
    {
        return <<<PROMPT
Analyze this medical certificate (MC) image and extract the following information. Return a valid JSON object with these fields:

{
    "patient_name": "Full name of the patient",
    "doctor_name": "Name of the attending doctor",
    "clinic_name": "Name of the clinic or hospital",
    "diagnosis": "Medical condition or reason for MC",
    "mc_start_date": "YYYY-MM-DD",
    "mc_end_date": "YYYY-MM-DD",
    "mc_days": 0,
    "mc_number": "Certificate or serial number",
    "issue_date": "YYYY-MM-DD",
    "doctor_reg_number": "Doctor's registration or license number (e.g., MMC number)",
    "additional_fields": {}
}

Rules:
- Date format must be YYYY-MM-DD
- mc_days should be an integer representing the total number of days of medical leave
- If mc_days is not explicitly stated, calculate it from mc_start_date and mc_end_date (inclusive)
- For doctor_reg_number, look for MMC number, registration number, or license number
- If a field cannot be determined from the image, set it to null
- Return ONLY the JSON object, no additional text
PROMPT;
    }

    public function analyzeDocument(string $imagePath): DocumentExtractionResult
    {
        $imageContent = Storage::disk('public')->get($imagePath);
        if (!$imageContent) {
            throw new \RuntimeException("Document image not found: {$imagePath}");
        }

        $mimeType = Storage::disk('public')->mimeType($imagePath) ?: 'image/jpeg';

        if ($mimeType === 'application/pdf') {
            $imageContent = $this->convertPdfToImage($imageContent);
            $mimeType = 'image/jpeg';
        }

        $base64Image = base64_encode($imageContent);

        $response = $this->callDocumentChatCompletion($base64Image, $mimeType);

        $parsed = $this->parseResponse($response);

        return DocumentExtractionResult::fromAiResponse($parsed, $response);
    }

    private function callDocumentChatCompletion(string $base64Image, string $mimeType): array
    {
        if (empty($this->apiKey)) {
            Log::warning('Abacus AI not configured - missing API key');
            return [];
        }

        $attempt = 0;
        $lastException = null;

        while ($attempt < $this->maxRetries) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->timeout($this->timeout)
                ->post($this->baseUrl . '/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an expert document OCR specialist. Analyze document images and extract structured data. Always return valid JSON.',
                        ],
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => $this->buildDocumentExtractionPrompt(),
                                ],
                                [
                                    'type' => 'image_url',
                                    'image_url' => [
                                        'url' => "data:{$mimeType};base64,{$base64Image}",
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'temperature' => 0.2,
                    'max_tokens' => 2000,
                    'stream' => false,
                ]);

                if ($response->successful()) {
                    $json = $response->json() ?? [];
                    Log::info('Abacus AI Document response received', [
                        'status' => $response->status(),
                        'model' => $json['model'] ?? 'unknown',
                        'tokens' => $json['usage']['total_tokens'] ?? 0,
                    ]);
                    return $json;
                }

                Log::warning('Abacus AI Document response error', [
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 500),
                    'attempt' => $attempt + 1,
                ]);

            } catch (\Exception $e) {
                $lastException = $e;
                Log::warning("Abacus AI Document attempt " . ($attempt + 1) . " failed: {$e->getMessage()}");
            }

            $attempt++;
            if ($attempt < $this->maxRetries) {
                sleep(min(pow(2, $attempt), 8));
            }
        }

        if ($lastException) {
            throw $lastException;
        }

        return [];
    }

    private function buildDocumentExtractionPrompt(): string
    {
        return <<<PROMPT
Analyze this document image and extract the following information. Return a valid JSON object with these fields:

{
    "document_type": "summons|business_card|contract|letter|invoice|warranty|certificate|other",
    "title": "Document title, subject line, or heading",
    "sender": "Person or organization who sent/issued this document",
    "recipient": "Person or organization this document is addressed to",
    "reference_number": "Any reference, serial, case, or ID number on the document",
    "issue_date": "YYYY-MM-DD",
    "expiry_date": "YYYY-MM-DD or null if not applicable",
    "description": "Brief 1-2 sentence summary of the document content and purpose",
    "additional_fields": {}
}

Rules:
- For document_type, classify as one of: summons (court/traffic/legal summons), business_card, contract (agreements, MOUs), letter (official correspondence), invoice (bills, payment notices), warranty (product warranties, guarantees), certificate (any certificate or license), other (anything else)
- Date format must be YYYY-MM-DD
- For expiry_date, only set if the document has a clear expiration (e.g., warranty end date, certificate validity, license expiry). Otherwise set to null
- For description, write a brief human-readable summary of what this document is about
- For additional_fields, include any other noteworthy data visible on the document (e.g., amounts, phone numbers, addresses)
- If a field cannot be determined from the image, set it to null
- Return ONLY the JSON object, no additional text
PROMPT;
    }

    public function suggestLhdnCategory(array $receiptData): ?string
    {
        $merchantName = $receiptData['merchant_name'] ?? '';
        $description = $receiptData['description'] ?? '';
        $lineItems = $receiptData['line_items'] ?? [];

        return $this->ruleBasedLhdnSuggestion($merchantName, $description, $lineItems);
    }

    /**
     * Call Abacus AI using OpenAI-compatible chat/completions endpoint.
     * Matches the pattern from /Users/rahmanazhar/Documents/Laravel/datafabric/app/Services/AbacusAiService.php
     */
    private function callChatCompletion(string $base64Image, string $mimeType): array
    {
        if (empty($this->apiKey)) {
            Log::warning('Abacus AI not configured - missing API key');
            return [];
        }

        $attempt = 0;
        $lastException = null;

        while ($attempt < $this->maxRetries) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->timeout($this->timeout)
                ->post($this->baseUrl . '/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an expert receipt OCR specialist. Analyze receipt images and extract structured data. Always return valid JSON.',
                        ],
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => $this->buildExtractionPrompt(),
                                ],
                                [
                                    'type' => 'image_url',
                                    'image_url' => [
                                        'url' => "data:{$mimeType};base64,{$base64Image}",
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'temperature' => 0.2,
                    'max_tokens' => 2000,
                    'stream' => false,
                ]);

                if ($response->successful()) {
                    $json = $response->json() ?? [];
                    Log::info('Abacus AI response received', [
                        'status' => $response->status(),
                        'model' => $json['model'] ?? 'unknown',
                        'tokens' => $json['usage']['total_tokens'] ?? 0,
                    ]);
                    return $json;
                }

                Log::warning('Abacus AI response error', [
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 500),
                    'attempt' => $attempt + 1,
                ]);

            } catch (\Exception $e) {
                $lastException = $e;
                Log::warning("Abacus AI attempt " . ($attempt + 1) . " failed: {$e->getMessage()}");
            }

            $attempt++;
            if ($attempt < $this->maxRetries) {
                sleep(min(pow(2, $attempt), 8));
            }
        }

        if ($lastException) {
            throw $lastException;
        }

        return [];
    }

    private function buildExtractionPrompt(): string
    {
        return <<<PROMPT
Analyze this receipt image and extract the following information. Return a valid JSON object with these fields:

{
    "merchant_name": "Name of the store/merchant",
    "total_amount": 0.00,
    "tax_amount": 0.00,
    "subtotal_amount": 0.00,
    "currency": "MYR",
    "purchase_date": "YYYY-MM-DD",
    "receipt_number": "receipt or invoice number",
    "payment_method": "cash|credit_card|debit_card|e_wallet|online_banking",
    "line_items": [
        {"description": "item name", "quantity": 1, "unit_price": 0.00, "total": 0.00}
    ],
    "additional_fields": {},
    "suggested_lhdn_category": "MEDICAL_SELF|EDUCATION_SELF|LIFESTYLE|LIFESTYLE_SPORT|DOMESTIC_TRAVEL|null",
    "metadata": {
        "category": "groceries|dining|transportation|healthcare|education|shopping|utilities|entertainment|travel|services|fuel|other",
        "description": "Brief 1-sentence summary of what this receipt is for",
        "is_taxable": true,
        "tax_type": "SST|GST|service_tax|null",
        "items": [
            {"name": "item name", "quantity": 1, "unit_price": 0.00, "total": 0.00}
        ]
    }
}

Rules:
- All monetary amounts should be numbers (not strings)
- If currency is not visible, assume MYR (Malaysian Ringgit)
- Date format must be YYYY-MM-DD
- For payment_method, use one of: cash, credit_card, debit_card, e_wallet, online_banking
- For suggested_lhdn_category, suggest the Malaysian LHDN tax relief category if applicable (medical, education, lifestyle, etc.), otherwise null
- For metadata.category, choose the single most appropriate category from the list based on what is being purchased
- For metadata.description, write a brief human-readable summary (e.g. "Weekly grocery shopping at Tesco")
- For metadata.is_taxable, set true if the receipt shows any tax (SST, GST, service tax), false otherwise
- For metadata.tax_type, specify the type of tax if is_taxable is true, otherwise null
- For metadata.items, list every individual line item visible on the receipt with name, quantity, unit_price, and total
- If a field cannot be determined from the image, set it to null
- Return ONLY the JSON object, no additional text
PROMPT;
    }

    /**
     * Parse OpenAI-compatible response format.
     * Response structure: { choices: [{ message: { content: "json string" } }] }
     */
    private function parseResponse(array $response): array
    {
        // Standard OpenAI format: choices[0].message.content
        $content = $response['choices'][0]['message']['content'] ?? '';

        if (empty($content)) {
            // Try alternative response fields
            $content = $response['result'] ?? $response['response'] ?? $response['content'] ?? '';
        }

        if (is_array($content) && isset($content['merchant_name'])) {
            return $content;
        }

        if (is_string($content) && !empty($content)) {
            // Remove markdown code block if present
            $content = preg_replace('/```json\s*/s', '', $content);
            $content = preg_replace('/```\s*/s', '', $content);
            $content = trim($content);

            // Try to find JSON object in the content
            if (preg_match('/\{[\s\S]*\}/s', $content, $matches)) {
                $decoded = json_decode($matches[0], true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    return $decoded;
                }
            }

            // Direct JSON decode
            $decoded = json_decode($content, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        Log::warning('Failed to parse Abacus AI response', [
            'response_keys' => array_keys($response),
            'content_preview' => is_string($content) ? substr($content, 0, 300) : gettype($content),
        ]);
        return [];
    }

    private function ruleBasedLhdnSuggestion(string $merchant, string $description, array $lineItems): ?string
    {
        $text = strtolower($merchant . ' ' . $description);

        $rules = [
            'MEDICAL_SELF' => ['clinic', 'hospital', 'pharmacy', 'dental', 'medical', 'doctor', 'health', 'ubat'],
            'MEDICAL_PARENTS' => ['parent medical', 'ibu', 'bapa'],
            'EDUCATION_SELF' => ['university', 'college', 'course', 'tuition', 'education', 'training', 'seminar'],
            'LIFESTYLE' => ['bookstore', 'book', 'magazine', 'computer', 'laptop', 'smartphone', 'internet', 'broadband', 'popular bookstore', 'kinokuniya'],
            'LIFESTYLE_SPORT' => ['gym', 'sport', 'fitness', 'decathlon', 'stadium', 'swimming'],
            'CHILDCARE' => ['childcare', 'kindergarten', 'nursery', 'tadika', 'taska'],
            'DOMESTIC_TRAVEL' => ['hotel', 'resort', 'airbnb', 'tourism', 'pelancongan'],
            'EV_CHARGING' => ['ev charging', 'electric vehicle', 'chargev'],
        ];

        foreach ($rules as $code => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($text, $keyword)) {
                    return $code;
                }
            }
        }

        return null;
    }
}
