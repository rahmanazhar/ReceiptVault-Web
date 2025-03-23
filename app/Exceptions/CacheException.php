<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class CacheException extends BaseException
{
    protected string $store;
    protected string $key;

    public function __construct(
        string $message = 'Cache operation failed',
        string $store = '',
        string $key = '',
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->store = $store;
        $this->key = $key;

        $context = array_merge([
            'store' => $store,
            'key' => $key,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'cache_error',
            'CACHE_ERROR',
            $code,
            $previous
        );
    }

    public static function storeFailed(
        string $store,
        string $key,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to store cache key '{$key}': {$reason}",
            $store,
            $key,
            $context
        );
    }

    public static function retrievalFailed(
        string $store,
        string $key,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to retrieve cache key '{$key}': {$reason}",
            $store,
            $key,
            $context
        );
    }

    public static function invalidKey(
        string $store,
        string $key,
        array $context = []
    ): self {
        return new static(
            "Invalid cache key format: '{$key}'",
            $store,
            $key,
            $context,
            Response::HTTP_BAD_REQUEST
        );
    }

    public static function keyNotFound(
        string $store,
        string $key,
        array $context = []
    ): self {
        return new static(
            "Cache key '{$key}' not found",
            $store,
            $key,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function lockTimeout(
        string $store,
        string $key,
        int $seconds,
        array $context = []
    ): self {
        return new static(
            "Failed to acquire lock for key '{$key}' after {$seconds} seconds",
            $store,
            $key,
            array_merge(['timeout' => $seconds], $context),
            Response::HTTP_CONFLICT
        );
    }

    public static function tagsFailed(
        string $store,
        array $tags,
        string $operation,
        array $context = []
    ): self {
        $tagList = implode("', '", $tags);
        return new static(
            "Failed to {$operation} cache tags: '{$tagList}'",
            $store,
            'tags',
            array_merge(['tags' => $tags, 'operation' => $operation], $context)
        );
    }

    public static function storeConnectionFailed(
        string $store,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to connect to cache store '{$store}': {$reason}",
            $store,
            'connection',
            $context,
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }

    public static function serializationFailed(
        string $store,
        string $key,
        array $context = []
    ): self {
        return new static(
            "Failed to serialize cache value for key '{$key}'",
            $store,
            $key,
            $context
        );
    }

    public static function deserializationFailed(
        string $store,
        string $key,
        array $context = []
    ): self {
        return new static(
            "Failed to deserialize cache value for key '{$key}'",
            $store,
            $key,
            $context
        );
    }

    public static function storageQuotaExceeded(
        string $store,
        string $key,
        int $size,
        int $maxSize,
        array $context = []
    ): self {
        return new static(
            "Cache storage quota exceeded. Attempted to store {$size} bytes (max: {$maxSize})",
            $store,
            $key,
            array_merge(['size' => $size, 'max_size' => $maxSize], $context),
            Response::HTTP_INSUFFICIENT_STORAGE
        );
    }
}
