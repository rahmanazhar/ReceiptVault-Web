<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class BusinessRuleException extends BaseException
{
    public function __construct(
        string $message = 'Business rule violation',
        string $rule = '',
        array $parameters = [],
        ?string $domain = null,
        int $code = Response::HTTP_UNPROCESSABLE_ENTITY,
        ?Exception $previous = null
    ) {
        $context = [
            'rule' => $rule,
            'parameters' => $parameters,
            'domain' => $domain,
        ];

        parent::__construct(
            $message,
            $context,
            'business_rule_violation',
            $rule,
            $code,
            $previous
        );
    }

    public static function insufficientBalance(float $required, float $available): self
    {
        return new static(
            "Insufficient balance. Required: {$required}, Available: {$available}",
            'insufficient_balance',
            ['required' => $required, 'available' => $available],
            'transaction'
        );
    }

    public static function duplicateTransaction(string $identifier): self
    {
        return new static(
            "Duplicate transaction detected: {$identifier}",
            'duplicate_transaction',
            ['identifier' => $identifier],
            'transaction'
        );
    }

    public static function invalidDateRange(string $start, string $end): self
    {
        return new static(
            "Invalid date range: {$start} to {$end}",
            'invalid_date_range',
            ['start' => $start, 'end' => $end],
            'validation'
        );
    }

    public static function limitExceeded(string $limit, string $value, string $type): self
    {
        return new static(
            "Exceeded {$type} limit of {$limit}",
            'limit_exceeded',
            ['limit' => $limit, 'value' => $value, 'type' => $type],
            'validation'
        );
    }

    public static function invalidStatusTransition(
        string $currentStatus,
        string $newStatus,
        string $entity
    ): self {
        return new static(
            "Cannot transition {$entity} from {$currentStatus} to {$newStatus}",
            'invalid_status_transition',
            ['current_status' => $currentStatus, 'new_status' => $newStatus, 'entity' => $entity],
            'workflow'
        );
    }
}
