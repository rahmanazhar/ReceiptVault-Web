<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class ServiceException extends BaseException
{
    protected string $service;
    protected string $action;

    public function __construct(
        string $message = 'Service operation failed',
        string $service = '',
        string $action = '',
        array $context = [],
        ?string $errorCode = null,
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->service = $service;
        $this->action = $action;

        $context = array_merge([
            'service' => $service,
            'action' => $action,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'service_error',
            $errorCode ?? "{$service}_{$action}_failed",
            $code,
            $previous
        );
    }

    public static function operationFailed(
        string $service,
        string $action,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to {$action} in {$service} service: {$reason}",
            $service,
            $action,
            $context
        );
    }

    public static function dependencyFailed(
        string $service,
        string $dependency,
        string $action,
        array $context = []
    ): self {
        return new static(
            "{$dependency} dependency failed during {$action} in {$service} service",
            $service,
            $action,
            array_merge(['dependency' => $dependency], $context),
            'DEPENDENCY_FAILED'
        );
    }

    public static function invalidConfiguration(
        string $service,
        string $config,
        array $context = []
    ): self {
        return new static(
            "Invalid configuration for {$service} service: {$config}",
            $service,
            'configuration',
            array_merge(['config' => $config], $context),
            'INVALID_CONFIG',
            Response::HTTP_INTERNAL_SERVER_ERROR
        );
    }

    public static function validationFailed(
        string $service,
        string $action,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Validation failed during {$action} in {$service} service",
            $service,
            $action,
            array_merge(['errors' => $errors], $context),
            'VALIDATION_FAILED',
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function unauthorized(
        string $service,
        string $action,
        string $reason = 'Insufficient permissions',
        array $context = []
    ): self {
        return new static(
            "{$reason} for {$action} in {$service} service",
            $service,
            $action,
            $context,
            'UNAUTHORIZED',
            Response::HTTP_FORBIDDEN
        );
    }

    public static function resourceNotFound(
        string $service,
        string $resource,
        $identifier,
        array $context = []
    ): self {
        return new static(
            "{$resource} not found in {$service} service: {$identifier}",
            $service,
            'find',
            array_merge(['resource' => $resource, 'identifier' => $identifier], $context),
            'RESOURCE_NOT_FOUND',
            Response::HTTP_NOT_FOUND
        );
    }

    public static function serviceUnavailable(
        string $service,
        string $reason = 'Service is temporarily unavailable',
        array $context = []
    ): self {
        return new static(
            "{$service} service is unavailable: {$reason}",
            $service,
            'availability',
            $context,
            'SERVICE_UNAVAILABLE',
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }
}
