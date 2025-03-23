<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Database\QueryException;
use PDOException;
use Symfony\Component\HttpFoundation\Response;

class DatabaseException extends BaseException
{
    protected string $operation;
    protected ?string $table;

    public function __construct(
        string $message = 'Database operation failed',
        string $operation = '',
        ?string $table = null,
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->operation = $operation;
        $this->table = $table;

        $context = array_merge([
            'operation' => $operation,
            'table' => $table,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'database_error',
            'DB_ERROR',
            $code,
            $previous
        );
    }

    public static function fromQueryException(
        QueryException $e,
        string $operation,
        ?string $table = null
    ): self {
        $context = [
            'sql' => $e->getSql(),
            'bindings' => $e->getBindings(),
            'code' => $e->getCode(),
        ];

        // Handle specific MySQL error codes
        $mysqlCode = $e->getPrevious() instanceof PDOException ? $e->getPrevious()->getCode() : null;
        switch ($mysqlCode) {
            case 1062: // Duplicate entry
                return new static(
                    'Duplicate entry found',
                    $operation,
                    $table,
                    $context,
                    Response::HTTP_CONFLICT
                );
            case 1451: // Cannot delete or update a parent row (foreign key constraint)
                return new static(
                    'Cannot delete or update due to foreign key constraint',
                    $operation,
                    $table,
                    $context,
                    Response::HTTP_CONFLICT
                );
            case 1452: // Cannot add or update a child row (foreign key constraint)
                return new static(
                    'Referenced record does not exist',
                    $operation,
                    $table,
                    $context,
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            default:
                return new static(
                    'Database operation failed',
                    $operation,
                    $table,
                    $context
                );
        }
    }

    public static function connectionFailed(
        Exception $e,
        string $connection = 'default'
    ): self {
        return new static(
            'Database connection failed',
            'connect',
            null,
            ['connection' => $connection, 'error' => $e->getMessage()],
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }

    public static function deadlock(
        string $operation,
        ?string $table = null,
        array $context = []
    ): self {
        return new static(
            'Deadlock detected during database operation',
            $operation,
            $table,
            $context,
            Response::HTTP_CONFLICT
        );
    }

    public static function lockTimeout(
        string $operation,
        ?string $table = null,
        array $context = []
    ): self {
        return new static(
            'Lock wait timeout exceeded',
            $operation,
            $table,
            $context,
            Response::HTTP_CONFLICT
        );
    }

    public static function uniqueConstraintViolation(
        string $operation,
        string $table,
        string $field,
        $value,
        array $context = []
    ): self {
        $context = array_merge([
            'field' => $field,
            'value' => $value,
        ], $context);

        return new static(
            "Unique constraint violation on field '{$field}'",
            $operation,
            $table,
            $context,
            Response::HTTP_CONFLICT
        );
    }

    public static function invalidForeignKey(
        string $operation,
        string $table,
        string $field,
        $value,
        array $context = []
    ): self {
        $context = array_merge([
            'field' => $field,
            'value' => $value,
        ], $context);

        return new static(
            "Invalid foreign key value for field '{$field}'",
            $operation,
            $table,
            $context,
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function transactionFailed(
        string $operation,
        array $context = []
    ): self {
        return new static(
            'Database transaction failed',
            $operation,
            null,
            $context
        );
    }
}
