<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class ApiException extends BaseException
{
    protected array $errors;
    protected array $headers;
    protected ?string $errorCode;

    public function __construct(
        string $message = 'API error occurred',
        array $errors = [],
        array $headers = [],
        ?string $errorCode = null,
        int $code = Response::HTTP_BAD_REQUEST,
        ?Exception $previous = null
    ) {
        $context = [
            'errors' => $errors,
            'headers' => $headers,
        ];

        parent::__construct(
            $message,
            $context,
            'api_error',
            $errorCode,
            $code,
            $previous
        );

        $this->errors = $errors;
        $this->headers = $headers;
        $this->errorCode = $errorCode;
    }

    public static function badRequest(
        string $message,
        array $errors = [],
        ?string $errorCode = null
    ): self {
        return new static(
            $message,
            $errors,
            [],
            $errorCode,
            Response::HTTP_BAD_REQUEST
        );
    }

    public static function unauthorized(
        string $message = 'Unauthorized',
        array $errors = [],
        ?string $errorCode = null
    ): self {
        return new static(
            $message,
            $errors,
            [],
            $errorCode ?? 'UNAUTHORIZED',
            Response::HTTP_UNAUTHORIZED
        );
    }

    public static function forbidden(
        string $message = 'Forbidden',
        array $errors = [],
        ?string $errorCode = null
    ): self {
        return new static(
            $message,
            $errors,
            [],
            $errorCode ?? 'FORBIDDEN',
            Response::HTTP_FORBIDDEN
        );
    }

    public static function notFound(
        string $resource,
        $identifier = null,
        array $errors = []
    ): self {
        $message = $identifier
            ? "{$resource} with identifier '{$identifier}' not found"
            : "{$resource} not found";

        return new static(
            $message,
            $errors,
            [],
            'NOT_FOUND',
            Response::HTTP_NOT_FOUND
        );
    }

    public static function methodNotAllowed(
        string $method,
        array $allowedMethods = []
    ): self {
        $headers = [];
        if (!empty($allowedMethods)) {
            $headers['Allow'] = implode(', ', $allowedMethods);
        }

        return new static(
            "Method {$method} not allowed",
            [],
            $headers,
            'METHOD_NOT_ALLOWED',
            Response::HTTP_METHOD_NOT_ALLOWED
        );
    }

    public static function conflict(
        string $message,
        array $errors = [],
        ?string $errorCode = null
    ): self {
        return new static(
            $message,
            $errors,
            [],
            $errorCode ?? 'CONFLICT',
            Response::HTTP_CONFLICT
        );
    }

    public static function preconditionFailed(
        string $message,
        array $errors = [],
        ?string $errorCode = null
    ): self {
        return new static(
            $message,
            $errors,
            [],
            $errorCode ?? 'PRECONDITION_FAILED',
            Response::HTTP_PRECONDITION_FAILED
        );
    }

    public static function tooManyRequests(
        int $retryAfter = 60,
        string $message = 'Too many requests'
    ): self {
        return new static(
            $message,
            [],
            ['Retry-After' => $retryAfter],
            'TOO_MANY_REQUESTS',
            Response::HTTP_TOO_MANY_REQUESTS
        );
    }

    public static function serverError(
        string $message = 'Internal server error',
        array $errors = [],
        ?string $errorCode = null
    ): self {
        return new static(
            $message,
            $errors,
            [],
            $errorCode ?? 'SERVER_ERROR',
            Response::HTTP_INTERNAL_SERVER_ERROR
        );
    }

    public static function serviceUnavailable(
        string $message = 'Service unavailable',
        int $retryAfter = 60
    ): self {
        return new static(
            $message,
            [],
            ['Retry-After' => $retryAfter],
            'SERVICE_UNAVAILABLE',
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }
}
