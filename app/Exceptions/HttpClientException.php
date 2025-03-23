<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Client\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class HttpClientException extends BaseException
{
    protected string $url;
    protected string $method;
    protected ?Response $response;

    public function __construct(
        string $message = 'HTTP request failed',
        string $url = '',
        string $method = '',
        ?Response $response = null,
        array $context = [],
        int $code = HttpResponse::HTTP_BAD_REQUEST,
        ?Exception $previous = null
    ) {
        $this->url = $url;
        $this->method = $method;
        $this->response = $response;

        $context = array_merge([
            'url' => $url,
            'method' => $method,
            'status_code' => $response?->status(),
            'response_body' => $this->sanitizeResponse($response),
        ], $context);

        parent::__construct(
            $message,
            $context,
            'http_client_error',
            'HTTP_CLIENT_ERROR',
            $code,
            $previous
        );
    }

    protected function sanitizeResponse(?Response $response): ?array
    {
        if (!$response) {
            return null;
        }

        try {
            $body = $response->json();
            // Remove sensitive data if needed
            unset($body['token'], $body['password'], $body['secret']);
            return $body;
        } catch (Exception $e) {
            return ['raw' => substr($response->body(), 0, 500)];
        }
    }

    public static function requestFailed(
        string $url,
        string $method,
        Response $response,
        array $context = []
    ): self {
        return new static(
            "HTTP {$method} request to {$url} failed with status {$response->status()}",
            $url,
            $method,
            $response,
            $context,
            $response->status()
        );
    }

    public static function connectionFailed(
        string $url,
        string $method,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to connect to {$url}: {$reason}",
            $url,
            $method,
            null,
            $context,
            HttpResponse::HTTP_BAD_GATEWAY
        );
    }

    public static function timeout(
        string $url,
        string $method,
        int $timeout,
        array $context = []
    ): self {
        return new static(
            "Request to {$url} timed out after {$timeout} seconds",
            $url,
            $method,
            null,
            array_merge(['timeout' => $timeout], $context),
            HttpResponse::HTTP_GATEWAY_TIMEOUT
        );
    }

    public static function invalidResponse(
        string $url,
        string $method,
        Response $response,
        array $context = []
    ): self {
        return new static(
            "Invalid response received from {$url}",
            $url,
            $method,
            $response,
            $context,
            HttpResponse::HTTP_BAD_GATEWAY
        );
    }

    public static function rateLimitExceeded(
        string $url,
        string $method,
        Response $response,
        int $retryAfter = 60,
        array $context = []
    ): self {
        return new static(
            "Rate limit exceeded for {$url}",
            $url,
            $method,
            $response,
            array_merge(['retry_after' => $retryAfter], $context),
            HttpResponse::HTTP_TOO_MANY_REQUESTS
        );
    }

    public static function unauthorized(
        string $url,
        string $method,
        Response $response,
        array $context = []
    ): self {
        return new static(
            "Unauthorized request to {$url}",
            $url,
            $method,
            $response,
            $context,
            HttpResponse::HTTP_UNAUTHORIZED
        );
    }

    public static function forbidden(
        string $url,
        string $method,
        Response $response,
        array $context = []
    ): self {
        return new static(
            "Forbidden request to {$url}",
            $url,
            $method,
            $response,
            $context,
            HttpResponse::HTTP_FORBIDDEN
        );
    }

    public static function notFound(
        string $url,
        string $method,
        Response $response,
        array $context = []
    ): self {
        return new static(
            "Resource not found at {$url}",
            $url,
            $method,
            $response,
            $context,
            HttpResponse::HTTP_NOT_FOUND
        );
    }

    public static function serverError(
        string $url,
        string $method,
        Response $response,
        array $context = []
    ): self {
        return new static(
            "Server error occurred at {$url}",
            $url,
            $method,
            $response,
            $context,
            HttpResponse::HTTP_BAD_GATEWAY
        );
    }

    public static function invalidRequest(
        string $url,
        string $method,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Invalid request to {$url}",
            $url,
            $method,
            null,
            array_merge(['validation_errors' => $errors], $context),
            HttpResponse::HTTP_BAD_REQUEST
        );
    }
}
