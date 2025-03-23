<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class JobException extends BaseException
{
    protected string $job;
    protected string $queue;
    protected int $attempts;

    public function __construct(
        string $message = 'Job execution failed',
        string $job = '',
        string $queue = '',
        int $attempts = 0,
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->job = $job;
        $this->queue = $queue;
        $this->attempts = $attempts;

        $context = array_merge([
            'job' => $job,
            'queue' => $queue,
            'attempts' => $attempts,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'job_error',
            'JOB_ERROR',
            $code,
            $previous
        );
    }

    public static function executionFailed(
        string $job,
        string $queue,
        int $attempts,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Job execution failed: {$reason}",
            $job,
            $queue,
            $attempts,
            $context
        );
    }

    public static function maxAttemptsExceeded(
        string $job,
        string $queue,
        int $maxAttempts,
        array $context = []
    ): self {
        return new static(
            "Job exceeded maximum attempts ({$maxAttempts})",
            $job,
            $queue,
            $maxAttempts,
            array_merge(['max_attempts' => $maxAttempts], $context)
        );
    }

    public static function timeout(
        string $job,
        string $queue,
        int $timeout,
        array $context = []
    ): self {
        return new static(
            "Job timed out after {$timeout} seconds",
            $job,
            $queue,
            0,
            array_merge(['timeout' => $timeout], $context),
            Response::HTTP_GATEWAY_TIMEOUT
        );
    }

    public static function invalidPayload(
        string $job,
        string $queue,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Invalid job payload",
            $job,
            $queue,
            0,
            array_merge(['errors' => $errors], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function missingDependencies(
        string $job,
        string $queue,
        array $dependencies,
        array $context = []
    ): self {
        return new static(
            "Job dependencies not satisfied",
            $job,
            $queue,
            0,
            array_merge(['missing_dependencies' => $dependencies], $context),
            Response::HTTP_PRECONDITION_FAILED
        );
    }

    public static function queueConnectionFailed(
        string $job,
        string $queue,
        string $connection,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Queue connection '{$connection}' failed: {$reason}",
            $job,
            $queue,
            0,
            array_merge(['connection' => $connection], $context),
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }

    public static function jobLocked(
        string $job,
        string $queue,
        string $lockKey,
        array $context = []
    ): self {
        return new static(
            "Job is locked (key: {$lockKey})",
            $job,
            $queue,
            0,
            array_merge(['lock_key' => $lockKey], $context),
            Response::HTTP_CONFLICT
        );
    }

    public static function jobNotFound(
        string $jobId,
        string $queue,
        array $context = []
    ): self {
        return new static(
            "Job '{$jobId}' not found in queue",
            $jobId,
            $queue,
            0,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function middlewareRejected(
        string $job,
        string $queue,
        string $middleware,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Job rejected by middleware '{$middleware}': {$reason}",
            $job,
            $queue,
            0,
            array_merge(['middleware' => $middleware], $context),
            Response::HTTP_FORBIDDEN
        );
    }

    public static function rateLimitExceeded(
        string $job,
        string $queue,
        int $limit,
        int $retryAfter,
        array $context = []
    ): self {
        return new static(
            "Job rate limit exceeded",
            $job,
            $queue,
            0,
            array_merge([
                'limit' => $limit,
                'retry_after' => $retryAfter
            ], $context),
            Response::HTTP_TOO_MANY_REQUESTS
        );
    }

    public static function batchFailed(
        string $batchId,
        string $queue,
        array $failedJobs,
        array $context = []
    ): self {
        $count = count($failedJobs);
        return new static(
            "Batch '{$batchId}' failed with {$count} failed jobs",
            'batch',
            $queue,
            0,
            array_merge([
                'batch_id' => $batchId,
                'failed_jobs' => $failedJobs
            ], $context)
        );
    }
}
