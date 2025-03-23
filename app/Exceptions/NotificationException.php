<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class NotificationException extends BaseException
{
    protected string $channel;
    protected string $notifiable;
    protected ?string $notification;

    public function __construct(
        string $message = 'Notification failed',
        string $channel = '',
        string $notifiable = '',
        ?string $notification = null,
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->channel = $channel;
        $this->notifiable = $notifiable;
        $this->notification = $notification;

        $context = array_merge([
            'channel' => $channel,
            'notifiable' => $notifiable,
            'notification' => $notification,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'notification_error',
            'NOTIFICATION_ERROR',
            $code,
            $previous
        );
    }

    public static function deliveryFailed(
        string $channel,
        string $notifiable,
        string $notification,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to deliver notification via {$channel}: {$reason}",
            $channel,
            $notifiable,
            $notification,
            $context
        );
    }

    public static function channelNotConfigured(
        string $channel,
        array $context = []
    ): self {
        return new static(
            "Notification channel '{$channel}' is not configured",
            $channel,
            'system',
            null,
            $context,
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }

    public static function invalidChannel(
        string $channel,
        array $context = []
    ): self {
        return new static(
            "Invalid notification channel: '{$channel}'",
            $channel,
            'system',
            null,
            $context,
            Response::HTTP_BAD_REQUEST
        );
    }

    public static function notifiableNotFound(
        string $channel,
        string $notifiable,
        array $context = []
    ): self {
        return new static(
            "Notifiable entity not found: '{$notifiable}'",
            $channel,
            $notifiable,
            null,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function rateLimitExceeded(
        string $channel,
        string $notifiable,
        int $limit,
        array $context = []
    ): self {
        return new static(
            "Notification rate limit exceeded for channel '{$channel}'",
            $channel,
            $notifiable,
            null,
            array_merge(['limit' => $limit], $context),
            Response::HTTP_TOO_MANY_REQUESTS
        );
    }

    public static function templateError(
        string $channel,
        string $notifiable,
        string $template,
        string $error,
        array $context = []
    ): self {
        return new static(
            "Error in notification template '{$template}': {$error}",
            $channel,
            $notifiable,
            null,
            array_merge(['template' => $template], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function invalidRecipient(
        string $channel,
        string $notifiable,
        string $recipient,
        array $context = []
    ): self {
        return new static(
            "Invalid recipient for {$channel} notification: '{$recipient}'",
            $channel,
            $notifiable,
            null,
            array_merge(['recipient' => $recipient], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function queueingFailed(
        string $channel,
        string $notifiable,
        string $notification,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to queue notification: {$reason}",
            $channel,
            $notifiable,
            $notification,
            $context
        );
    }

    public static function thirdPartyError(
        string $channel,
        string $service,
        string $error,
        array $context = []
    ): self {
        return new static(
            "Third-party service '{$service}' error: {$error}",
            $channel,
            'system',
            null,
            array_merge(['service' => $service], $context),
            Response::HTTP_BAD_GATEWAY
        );
    }

    public static function batchFailed(
        string $channel,
        array $failed,
        array $context = []
    ): self {
        $count = count($failed);
        return new static(
            "Batch notification failed for {$count} recipients",
            $channel,
            'batch',
            null,
            array_merge(['failed_notifications' => $failed], $context)
        );
    }
}
