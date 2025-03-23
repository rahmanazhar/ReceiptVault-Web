<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class RepositoryException extends BaseException
{
    protected string $model;
    protected string $operation;

    public function __construct(
        string $message = 'Repository operation failed',
        string $model = '',
        string $operation = '',
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->model = $model;
        $this->operation = $operation;

        $context = array_merge([
            'model' => $model,
            'operation' => $operation,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'repository_error',
            "{$operation}_failed",
            $code,
            $previous
        );
    }

    public static function createFailed(string $model, array $data = []): self
    {
        return new static(
            "Failed to create {$model}",
            $model,
            'create',
            ['data' => $data]
        );
    }

    public static function updateFailed(string $model, $id, array $data = []): self
    {
        return new static(
            "Failed to update {$model} with ID {$id}",
            $model,
            'update',
            ['id' => $id, 'data' => $data]
        );
    }

    public static function deleteFailed(string $model, $id): self
    {
        return new static(
            "Failed to delete {$model} with ID {$id}",
            $model,
            'delete',
            ['id' => $id]
        );
    }

    public static function notFound(string $model, $id): self
    {
        return new static(
            "{$model} with ID {$id} not found",
            $model,
            'find',
            ['id' => $id],
            Response::HTTP_NOT_FOUND
        );
    }

    public static function bulkOperationFailed(
        string $model,
        string $operation,
        array $ids = []
    ): self {
        return new static(
            "Bulk {$operation} operation failed for {$model}",
            $model,
            "bulk_{$operation}",
            ['ids' => $ids]
        );
    }

    public static function relationshipOperationFailed(
        string $model,
        string $relation,
        string $operation,
        $id = null
    ): self {
        $context = [
            'relation' => $relation,
            'operation' => $operation,
        ];

        if ($id !== null) {
            $context['id'] = $id;
        }

        return new static(
            "Failed to {$operation} {$relation} relationship for {$model}" . ($id ? " with ID {$id}" : ''),
            $model,
            "{$operation}_relation",
            $context
        );
    }

    public static function invalidQuery(string $model, string $reason, array $params = []): self
    {
        return new static(
            "Invalid query for {$model}: {$reason}",
            $model,
            'invalid_query',
            ['reason' => $reason, 'params' => $params],
            Response::HTTP_BAD_REQUEST
        );
    }

    public static function uniqueConstraintViolation(
        string $model,
        string $field,
        $value
    ): self {
        return new static(
            "A {$model} with {$field} '{$value}' already exists",
            $model,
            'unique_constraint',
            ['field' => $field, 'value' => $value],
            Response::HTTP_CONFLICT
        );
    }
}
