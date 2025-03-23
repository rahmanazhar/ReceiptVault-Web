<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class EventException extends BaseException
{
    protected string $event;
    protected string $listener;

    public function __construct(
        string $message = 'Event handling failed',
        string $event = '',
        string $listener = '',
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->event = $event;
        $this->listener = $listener;

        $context = array_merge([
            'event' => $event,
            'listener' => $listener,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'event_error',
            'EVENT_ERROR',
            $code,
            $previous
        );
    }

    public static function listenerFailed(
        string $event,
        string $listener,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Event listener failed: {$reason}",
            $event,
            $listener,
            $context
        );
    }

    public static function broadcastFailed(
        string $event,
        string $channel,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to broadcast event to channel '{$channel}': {$reason}",
            $event,
            'broadcaster',
            array_merge(['channel' => $channel], $context)
        );
    }

    public static function invalidPayload(
        string $event,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Invalid event payload for '{$event}'",
            $event,
            'validator',
            array_merge(['errors' => $errors], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function channelAuthFailed(
        string $event,
        string $channel,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Channel authentication failed for '{$channel}': {$reason}",
            $event,
            'auth',
            array_merge(['channel' => $channel], $context),
            Response::HTTP_UNAUTHORIZED
        );
    }

    public static function subscriptionFailed(
        string $event,
        string $channel,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to subscribe to channel '{$channel}': {$reason}",
            $event,
            'subscription',
            array_merge(['channel' => $channel], $context)
        );
    }

    public static function queueingFailed(
        string $event,
        string $listener,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to queue event listener: {$reason}",
            $event,
            $listener,
            $context
        );
    }

    public static function handlerNotFound(
        string $event,
        string $handler,
        array $context = []
    ): self {
        return new static(
            "Event handler '{$handler}' not found",
            $event,
            $handler,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function duplicateListener(
        string $event,
        string $listener,
        array $context = []
    ): self {
        return new static(
            "Duplicate event listener registration",
            $event,
            $listener,
            $context,
            Response::HTTP_CONFLICT
        );
    }

    public static function broadcastingDisabled(
        string $event,
        array $context = []
    ): self {
        return new static(
            "Broadcasting is disabled for event '{$event}'",
            $event,
            'broadcaster',
            $context,
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }

    public static function rateLimitExceeded(
        string $event,
        string $channel,
        int $limit,
        array $context = []
    ): self {
        return new static(
            "Event broadcasting rate limit exceeded for channel '{$channel}'",
            $event,
            'rate_limiter',
            array_merge(['channel' => $channel, 'limit' => $limit], $context),
            Response::HTTP_TOO_MANY_REQUESTS
        );
    }
}
