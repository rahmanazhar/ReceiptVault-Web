<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class QueueException extends BaseException
{
    protected string $queue;
    protected string $job;

    public function __construct(
        string $message = 'Queue operation failed',
        string $queue = '',
        string $job = '',
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->queue = $queue;
        $this->job = $job;

        $context = array_merge([
            'queue' => $queue,
            'job' => $job,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'queue_error',
            'QUEUE_ERROR',
            $code,
            $previous
        );
    }

    public static function jobFailed(
        string $queue,
        string $job,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Job '{$job}' failed in queue '{$queue}': {$reason}",
            $queue,
            $job,
            $context
        );
    }

    public static function jobTimeout(
        string $queue,
        string $job,
        int $timeout,
        array $context = []
    ): self {
        return new static(
            "Job '{$job}' timed out after {$timeout} seconds",
            $queue,
            $job,
            array_merge(['timeout' => $timeout], $context),
            Response::HTTP_GATEWAY_TIMEOUT
        );
    }

    public static function queueConnectionFailed(
        string $connection,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Queue connection '{$connection}' failed: {$reason}",
            $connection,
            'connection',
            $context,
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }

    public static function maxAttemptsExceeded(
        string $queue,
        string $job,
        int $attempts,
        array $context = []
    ): self {
        return new static(
            "Job '{$job}' exceeded maximum attempts ({$attempts})",
            $queue,
            $job,
            array_merge(['max_attempts' => $attempts], $context)
        );
    }

    public static function invalidPayload(
        string $queue,
        string $job,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Invalid payload for job '{$job}'",
            $queue,
            $job,
            array_merge(['errors' => $errors], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function jobLocked(
        string $queue,
        string $job,
        string $lockKey,
        array $context = []
    ): self {
        return new static(
            "Job '{$job}' is locked (key: {$lockKey})",
            $queue,
            $job,
            array_merge(['lock_key' => $lockKey], $context),
            Response::HTTP_CONFLICT
        );
    }

    public static function queueFull(
        string $queue,
        int $size,
        array $context = []
    ): self {
        return new static(
            "Queue '{$queue}' is full (size: {$size})",
            $queue,
            'queue_full',
            array_merge(['size' => $size], $context),
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }

    public static function jobNotFound(
        string $queue,
        string $jobId,
        array $context = []
    ): self {
        return new static(
            "Job '{$jobId}' not found in queue '{$queue}'",
            $queue,
            'job_not_found',
            array_merge(['job_id' => $jobId], $context),
            Response::HTTP_NOT_FOUND
        );
    }

    public static function batchFailed(
        string $queue,
        string $batchId,
        array $failedJobs,
        array $context = []
    ): self {
        return new static(
            "Batch '{$batchId}' failed with " . count($failedJobs) . " failed jobs",
            $queue,
            'batch_failed',
            array_merge([
                'batch_id' => $batchId,
                'failed_jobs' => $failedJobs
            ], $context)
        );
    }
}
