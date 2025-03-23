<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class EncryptionException extends BaseException
{
    protected string $operation;
    protected ?string $key;

    public function __construct(
        string $message = 'Encryption operation failed',
        string $operation = '',
        ?string $key = null,
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->operation = $operation;
        $this->key = $key;

        $context = array_merge([
            'operation' => $operation,
            'key_identifier' => $key ? hash('sha256', $key) : null,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'encryption_error',
            'ENCRYPTION_ERROR',
            $code,
            $previous
        );
    }

    public static function encryptionFailed(
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Encryption failed: {$reason}",
            'encrypt',
            null,
            $context
        );
    }

    public static function decryptionFailed(
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Decryption failed: {$reason}",
            'decrypt',
            null,
            $context
        );
    }

    public static function invalidKey(
        string $key,
        array $context = []
    ): self {
        return new static(
            'Invalid encryption key',
            'key_validation',
            $key,
            $context,
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function keyNotFound(
        string $keyId,
        array $context = []
    ): self {
        return new static(
            "Encryption key not found: {$keyId}",
            'key_lookup',
            null,
            array_merge(['key_id' => $keyId], $context),
            Response::HTTP_NOT_FOUND
        );
    }

    public static function keyGenerationFailed(
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to generate encryption key: {$reason}",
            'key_generation',
            null,
            $context
        );
    }

    public static function invalidPayload(
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Invalid encryption payload: {$reason}",
            'payload_validation',
            null,
            $context,
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function algorithmNotSupported(
        string $algorithm,
        array $supportedAlgorithms,
        array $context = []
    ): self {
        $supported = implode("', '", $supportedAlgorithms);
        return new static(
            "Encryption algorithm '{$algorithm}' not supported. Supported: '{$supported}'",
            'algorithm_validation',
            null,
            array_merge([
                'algorithm' => $algorithm,
                'supported_algorithms' => $supportedAlgorithms
            ], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function keyRotationFailed(
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Key rotation failed: {$reason}",
            'key_rotation',
            null,
            $context
        );
    }

    public static function signatureVerificationFailed(
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Signature verification failed: {$reason}",
            'signature_verification',
            null,
            $context,
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function paddingError(
        string $operation,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Padding error during {$operation}: {$reason}",
            $operation,
            null,
            $context,
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function ivGenerationFailed(
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to generate initialization vector: {$reason}",
            'iv_generation',
            null,
            $context
        );
    }

    public static function keyDerivationFailed(
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Key derivation failed: {$reason}",
            'key_derivation',
            null,
            $context
        );
    }
}
