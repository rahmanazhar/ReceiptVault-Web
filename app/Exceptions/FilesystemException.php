<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class FilesystemException extends BaseException
{
    protected string $disk;
    protected string $path;

    public function __construct(
        string $message = 'Filesystem operation failed',
        string $disk = '',
        string $path = '',
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->disk = $disk;
        $this->path = $path;

        $context = array_merge([
            'disk' => $disk,
            'path' => $path,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'filesystem_error',
            'FILESYSTEM_ERROR',
            $code,
            $previous
        );
    }

    public static function fileNotFound(
        string $disk,
        string $path,
        array $context = []
    ): self {
        return new static(
            "File not found: '{$path}'",
            $disk,
            $path,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function directoryNotFound(
        string $disk,
        string $path,
        array $context = []
    ): self {
        return new static(
            "Directory not found: '{$path}'",
            $disk,
            $path,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function writeFailed(
        string $disk,
        string $path,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to write file '{$path}': {$reason}",
            $disk,
            $path,
            $context
        );
    }

    public static function readFailed(
        string $disk,
        string $path,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to read file '{$path}': {$reason}",
            $disk,
            $path,
            $context
        );
    }

    public static function deleteFailed(
        string $disk,
        string $path,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to delete '{$path}': {$reason}",
            $disk,
            $path,
            $context
        );
    }

    public static function copyFailed(
        string $disk,
        string $source,
        string $destination,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to copy '{$source}' to '{$destination}': {$reason}",
            $disk,
            $source,
            array_merge(['destination' => $destination], $context)
        );
    }

    public static function moveFailed(
        string $disk,
        string $source,
        string $destination,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to move '{$source}' to '{$destination}': {$reason}",
            $disk,
            $source,
            array_merge(['destination' => $destination], $context)
        );
    }

    public static function invalidPath(
        string $disk,
        string $path,
        array $context = []
    ): self {
        return new static(
            "Invalid file path: '{$path}'",
            $disk,
            $path,
            $context,
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function permissionDenied(
        string $disk,
        string $path,
        string $operation,
        array $context = []
    ): self {
        return new static(
            "Permission denied for {$operation} operation on '{$path}'",
            $disk,
            $path,
            array_merge(['operation' => $operation], $context),
            Response::HTTP_FORBIDDEN
        );
    }

    public static function diskNotFound(
        string $disk,
        array $context = []
    ): self {
        return new static(
            "Storage disk '{$disk}' not found",
            $disk,
            '',
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function quotaExceeded(
        string $disk,
        string $path,
        int $size,
        int $available,
        array $context = []
    ): self {
        return new static(
            "Storage quota exceeded. Required: {$size} bytes, Available: {$available} bytes",
            $disk,
            $path,
            array_merge([
                'required_size' => $size,
                'available_space' => $available
            ], $context),
            Response::HTTP_INSUFFICIENT_STORAGE
        );
    }

    public static function lockTimeout(
        string $disk,
        string $path,
        int $seconds,
        array $context = []
    ): self {
        return new static(
            "Failed to acquire file lock for '{$path}' after {$seconds} seconds",
            $disk,
            $path,
            array_merge(['timeout' => $seconds], $context),
            Response::HTTP_CONFLICT
        );
    }

    public static function invalidMimeType(
        string $disk,
        string $path,
        string $mimeType,
        array $allowedTypes,
        array $context = []
    ): self {
        $allowed = implode("', '", $allowedTypes);
        return new static(
            "Invalid file type '{$mimeType}' for '{$path}'. Allowed: '{$allowed}'",
            $disk,
            $path,
            array_merge([
                'mime_type' => $mimeType,
                'allowed_types' => $allowedTypes
            ], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }
}
