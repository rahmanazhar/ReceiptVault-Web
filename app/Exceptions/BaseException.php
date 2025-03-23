<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

abstract class BaseException extends Exception
{
    protected array $context = [];
    protected string $errorType;
    protected ?string $errorCode = null;
    protected array $headers = [];

    public function __construct(
        string $message = '',
        array $context = [],
        string $errorType = 'error',
        ?string $errorCode = null,
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null,
        array $headers = []
    ) {
        parent::__construct($message, $code, $previous);
        $this->context = $context;
        $this->errorType = $errorType;
        $this->errorCode = $errorCode;
        $this->headers = $headers;
    }

    public function getContext(): array
    {
        return $this->context;
    }

    public function getErrorType(): string
    {
        return $this->errorType;
    }

    public function getErrorCode(): ?string
    {
        return $this->errorCode;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function render(): JsonResponse
    {
        $response = [
            'message' => $this->getMessage(),
            'type' => $this->getErrorType(),
        ];

        if ($this->errorCode) {
            $response['error_code'] = $this->errorCode;
        }

        if (config('app.debug')) {
            $response['debug'] = [
                'context' => $this->context,
                'file' => $this->getFile(),
                'line' => $this->getLine(),
                'trace' => $this->getTrace(),
            ];
        }

        return response()->json(
            $response,
            $this->getCode(),
            $this->getHeaders()
        );
    }

    public function report(): void
    {
        $context = array_merge($this->context, [
            'error_type' => $this->errorType,
            'error_code' => $this->errorCode,
            'file' => $this->getFile(),
            'line' => $this->getLine(),
            'trace' => $this->getTraceAsString(),
        ]);

        $this->logError($context);
    }

    protected function logError(array $context): void
    {
        $level = $this->getLogLevel();
        Log::log($level, $this->getMessage(), $context);
    }

    protected function getLogLevel(): string
    {
        $codeMap = [
            Response::HTTP_INTERNAL_SERVER_ERROR => 'error',
            Response::HTTP_SERVICE_UNAVAILABLE => 'critical',
            Response::HTTP_BAD_REQUEST => 'warning',
            Response::HTTP_UNAUTHORIZED => 'warning',
            Response::HTTP_FORBIDDEN => 'warning',
            Response::HTTP_NOT_FOUND => 'info',
            Response::HTTP_UNPROCESSABLE_ENTITY => 'warning',
        ];

        return $codeMap[$this->getCode()] ?? 'error';
    }

    /**
     * Create a new exception instance with additional context.
     */
    public static function withContext(string $message, array $context = []): static
    {
        return new static($message, $context);
    }

    /**
     * Create a new exception instance with headers.
     */
    public static function withHeaders(string $message, array $headers = []): static
    {
        return new static($message, [], 'error', null, Response::HTTP_INTERNAL_SERVER_ERROR, null, $headers);
    }

    /**
     * Create a new exception instance with an error code.
     */
    public static function withErrorCode(string $message, string $errorCode): static
    {
        return new static($message, [], 'error', $errorCode);
    }
}
