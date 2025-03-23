<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class LogException extends BaseException
{
    protected string $channel;
    protected string $level;

    public function __construct(
        string $message = 'Logging operation failed',
        string $channel = '',
        string $level = '',
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->channel = $channel;
        $this->level = $level;

        $context = array_merge([
            'channel' => $channel,
            'level' => $level,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'log_error',
            'LOG_ERROR',
            $code,
            $previous
        );
    }

    public static function channelNotFound(
        string $channel,
        array $context = []
    ): self {
        return new static(
            "Log channel '{$channel}' not found",
            $channel,
            'error',
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function invalidChannel(
        string $channel,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Invalid log channel configuration for '{$channel}'",
            $channel,
            'error',
            array_merge(['errors' => $errors], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function writeFailed(
        string $channel,
        string $level,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to write log message: {$reason}",
            $channel,
            $level,
            $context
        );
    }

    public static function invalidLevel(
        string $channel,
        string $level,
        array $allowedLevels,
        array $context = []
    ): self {
        $allowed = implode("', '", $allowedLevels);
        return new static(
            "Invalid log level '{$level}'. Allowed: '{$allowed}'",
            $channel,
            $level,
            array_merge(['allowed_levels' => $allowedLevels], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function handlerFailed(
        string $channel,
        string $handler,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Log handler '{$handler}' failed: {$reason}",
            $channel,
            'error',
            array_merge(['handler' => $handler], $context)
        );
    }

    public static function formatterFailed(
        string $channel,
        string $formatter,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Log formatter '{$formatter}' failed: {$reason}",
            $channel,
            'error',
            array_merge(['formatter' => $formatter], $context)
        );
    }

    public static function processorFailed(
        string $channel,
        string $processor,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Log processor '{$processor}' failed: {$reason}",
            $channel,
            'error',
            array_merge(['processor' => $processor], $context)
        );
    }

    public static function invalidContext(
        string $channel,
        string $level,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Invalid log context data",
            $channel,
            $level,
            array_merge(['errors' => $errors], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function storageQuotaExceeded(
        string $channel,
        int $size,
        int $maxSize,
        array $context = []
    ): self {
        return new static(
            "Log storage quota exceeded. Current size: {$size} bytes (max: {$maxSize})",
            $channel,
            'error',
            array_merge(['size' => $size, 'max_size' => $maxSize], $context),
            Response::HTTP_INSUFFICIENT_STORAGE
        );
    }

    public static function rotationFailed(
        string $channel,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Log rotation failed: {$reason}",
            $channel,
            'error',
            $context
        );
    }

    public static function stackTraceGenerationFailed(
        string $channel,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to generate stack trace: {$reason}",
            $channel,
            'error',
            $context
        );
    }
}
