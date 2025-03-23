<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class SessionException extends BaseException
{
    protected string $driver;
    protected ?string $key;

    public function __construct(
        string $message = 'Session operation failed',
        string $driver = '',
        ?string $key = null,
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->driver = $driver;
        $this->key = $key;

        $context = array_merge([
            'driver' => $driver,
            'key' => $key,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'session_error',
            'SESSION_ERROR',
            $code,
            $previous
        );
    }

    public static function driverNotFound(
        string $driver,
        array $context = []
    ): self {
        return new static(
            "Session driver '{$driver}' not found",
            $driver,
            null,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function invalidDriver(
        string $driver,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Invalid session driver configuration for '{$driver}'",
            $driver,
            null,
            array_merge(['errors' => $errors], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function storeFailed(
        string $driver,
        string $key,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to store session data: {$reason}",
            $driver,
            $key,
            $context
        );
    }

    public static function retrievalFailed(
        string $driver,
        string $key,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to retrieve session data: {$reason}",
            $driver,
            $key,
            $context
        );
    }

    public static function invalidKey(
        string $driver,
        string $key,
        array $context = []
    ): self {
        return new static(
            "Invalid session key format: '{$key}'",
            $driver,
            $key,
            $context,
            Response::HTTP_BAD_REQUEST
        );
    }

    public static function keyNotFound(
        string $driver,
        string $key,
        array $context = []
    ): self {
        return new static(
            "Session key '{$key}' not found",
            $driver,
            $key,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function handlerFailed(
        string $driver,
        string $handler,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Session handler '{$handler}' failed: {$reason}",
            $driver,
            null,
            array_merge(['handler' => $handler], $context)
        );
    }

    public static function serializationFailed(
        string $driver,
        string $key,
        array $context = []
    ): self {
        return new static(
            "Failed to serialize session data for key '{$key}'",
            $driver,
            $key,
            $context
        );
    }

    public static function deserializationFailed(
        string $driver,
        string $key,
        array $context = []
    ): self {
        return new static(
            "Failed to deserialize session data for key '{$key}'",
            $driver,
            $key,
            $context
        );
    }

    public static function invalidData(
        string $driver,
        string $key,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Invalid session data for key '{$key}'",
            $driver,
            $key,
            array_merge(['errors' => $errors], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function storageQuotaExceeded(
        string $driver,
        int $size,
        int $maxSize,
        array $context = []
    ): self {
        return new static(
            "Session storage quota exceeded. Attempted to store {$size} bytes (max: {$maxSize})",
            $driver,
            null,
            array_merge(['size' => $size, 'max_size' => $maxSize], $context),
            Response::HTTP_INSUFFICIENT_STORAGE
        );
    }

    public static function lockTimeout(
        string $driver,
        string $key,
        int $seconds,
        array $context = []
    ): self {
        return new static(
            "Failed to acquire session lock for key '{$key}' after {$seconds} seconds",
            $driver,
            $key,
            array_merge(['timeout' => $seconds], $context),
            Response::HTTP_CONFLICT
        );
    }
}
