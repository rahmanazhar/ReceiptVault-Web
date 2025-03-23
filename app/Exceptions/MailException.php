<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class MailException extends BaseException
{
    protected string $mailer;
    protected string $template;
    protected ?string $recipient;

    public function __construct(
        string $message = 'Mail operation failed',
        string $mailer = '',
        string $template = '',
        ?string $recipient = null,
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->mailer = $mailer;
        $this->template = $template;
        $this->recipient = $recipient;

        $context = array_merge([
            'mailer' => $mailer,
            'template' => $template,
            'recipient' => $recipient,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'mail_error',
            'MAIL_ERROR',
            $code,
            $previous
        );
    }

    public static function sendFailed(
        string $mailer,
        string $template,
        string $recipient,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to send email: {$reason}",
            $mailer,
            $template,
            $recipient,
            $context
        );
    }

    public static function templateNotFound(
        string $mailer,
        string $template,
        array $context = []
    ): self {
        return new static(
            "Email template '{$template}' not found",
            $mailer,
            $template,
            null,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function invalidTemplate(
        string $mailer,
        string $template,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Invalid email template '{$template}'",
            $mailer,
            $template,
            null,
            array_merge(['errors' => $errors], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function invalidRecipient(
        string $mailer,
        string $template,
        string $recipient,
        array $context = []
    ): self {
        return new static(
            "Invalid email recipient: {$recipient}",
            $mailer,
            $template,
            $recipient,
            $context,
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function configurationError(
        string $mailer,
        string $setting,
        array $context = []
    ): self {
        return new static(
            "Invalid mail configuration: {$setting}",
            $mailer,
            'config',
            null,
            array_merge(['setting' => $setting], $context),
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }

    public static function transportFailed(
        string $mailer,
        string $transport,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Mail transport '{$transport}' failed: {$reason}",
            $mailer,
            'transport',
            null,
            array_merge(['transport' => $transport], $context),
            Response::HTTP_SERVICE_UNAVAILABLE
        );
    }

    public static function rateLimitExceeded(
        string $mailer,
        int $limit,
        int $period,
        array $context = []
    ): self {
        return new static(
            "Email rate limit exceeded ({$limit} per {$period} seconds)",
            $mailer,
            'rate_limit',
            null,
            array_merge([
                'limit' => $limit,
                'period' => $period
            ], $context),
            Response::HTTP_TOO_MANY_REQUESTS
        );
    }

    public static function attachmentFailed(
        string $mailer,
        string $template,
        string $attachment,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to attach file '{$attachment}': {$reason}",
            $mailer,
            $template,
            null,
            array_merge(['attachment' => $attachment], $context)
        );
    }

    public static function queueingFailed(
        string $mailer,
        string $template,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to queue email: {$reason}",
            $mailer,
            $template,
            null,
            $context
        );
    }

    public static function batchFailed(
        string $mailer,
        array $failed,
        array $context = []
    ): self {
        $count = count($failed);
        return new static(
            "Batch email sending failed for {$count} recipients",
            $mailer,
            'batch',
            null,
            array_merge(['failed_recipients' => $failed], $context)
        );
    }
}
