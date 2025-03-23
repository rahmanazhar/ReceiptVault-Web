<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\{JsonResponse, Request};
use Illuminate\Validation\ValidationException;
use App\Exceptions\{
    ApiException,
    BusinessRuleException,
    CacheException,
    DatabaseException,
    EncryptionException,
    EventException,
    FileUploadException,
    FilesystemException,
    HttpClientException,
    JobException,
    LogException,
    MailException,
    NotificationException,
    OcrProcessingException,
    QueueException,
    RepositoryException,
    ServiceException,
    SessionException,
    ValidationException as CustomValidationException,
    ViewException
};
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Contracts\Encryption\{DecryptException, EncryptException};
use Psr\Log\LoggerInterface;
use Illuminate\View\ViewException as LaravelViewException;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\Mailer\Exception\TransportException;
use Illuminate\Queue\MaxAttemptsExceededException;
use Illuminate\Http\Client\{ConnectionException, RequestException};
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Notifications\Events\NotificationFailed;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Queue\WorkerOptions;
use Illuminate\Queue\Events\JobExceptionOccurred;
use PHPOpenSourceSaver\JWTAuth\Exceptions\{
    JWTException,
    TokenExpiredException,
    TokenInvalidException
};
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            if ($e instanceof ServiceException ||
                $e instanceof RepositoryException ||
                $e instanceof OcrProcessingException ||
                $e instanceof FileUploadException ||
                $e instanceof BusinessRuleException ||
                $e instanceof DatabaseException ||
                $e instanceof QueueException ||
                $e instanceof CacheException ||
                $e instanceof NotificationException ||
                $e instanceof EventException ||
                $e instanceof HttpClientException ||
                $e instanceof JobException ||
                $e instanceof MailException ||
                $e instanceof SessionException ||
                $e instanceof ViewException ||
                $e instanceof LogException ||
                $e instanceof EncryptionException ||
                $e instanceof FilesystemException
            ) {
                $e->report();
            }
        });

        $this->renderable(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $this->handleApiException($e, $request);
            }
            return null;
        });
    }

    /**
     * Handle API exceptions.
     */
    private function handleApiException(Throwable $e, Request $request): JsonResponse
    {
        if ($e instanceof FileNotFoundException) {
            return FilesystemException::fileNotFound(
                config('filesystems.default'),
                $e->getMessage() ?: 'unknown',
                []
            )->render();
        }

        if ($e instanceof EncryptException) {
            return EncryptionException::encryptionFailed(
                $e->getMessage()
            )->render();
        }

        if ($e instanceof DecryptException) {
            return EncryptionException::decryptionFailed(
                $e->getMessage()
            )->render();
        }

        if ($e instanceof \RuntimeException && str_contains($e->getMessage(), 'Failed to create directory')) {
            return LogException::writeFailed(
                config('logging.default'),
                'error',
                $e->getMessage()
            )->render();
        }

        if ($e instanceof LaravelViewException) {
            $message = $e->getMessage();
            $view = '';
            
            // Extract view name from error message if possible
            if (preg_match('/View \[(.*?)\] not found/', $message, $matches)) {
                $view = $matches[1];
                return ViewException::viewNotFound($view)->render();
            }
            
            return ViewException::renderingFailed(
                $view,
                $message
            )->render();
        }

        if ($e instanceof TokenMismatchException) {
            return SessionException::invalidData(
                config('session.driver'),
                'csrf_token',
                ['message' => 'CSRF token mismatch'],
                ['token' => $request->input('_token', '')]
            )->render();
        }

        if ($e instanceof TransportException) {
            return MailException::transportFailed(
                config('mail.default'),
                config('mail.mailers.'.config('mail.default').'.transport'),
                $e->getMessage()
            )->render();
        }

        if ($e instanceof MaxAttemptsExceededException) {
            return JobException::executionFailed(
                class_basename($e->getMessage()),
                config('queue.default'),
                config('queue.connections.'.config('queue.default').'.tries', 3),
                'Maximum attempts exceeded'
            )->render();
        }

        if ($e instanceof ConnectionException || $e instanceof RequestException) {
            return HttpClientException::connectionFailed(
                'external-api',
                'request',
                $e->getMessage()
            )->render();
        }

        if ($e instanceof BroadcastException) {
            return EventException::broadcastFailed(
                'unknown',
                'unknown',
                $e->getMessage()
            )->render();
        }

        if ($e instanceof NotificationFailed) {
            return NotificationException::deliveryFailed(
                $e->channel ?? 'unknown',
                get_class($e->notifiable),
                get_class($e->notification),
                $e->data['message'] ?? 'Unknown error'
            )->render();
        }

        if ($e instanceof QueryException) {
            return DatabaseException::fromQueryException(
                $e,
                'query'
            )->render();
        }

        if ($e instanceof ApiException) {
            return $e->render();
        }

        if ($e instanceof CustomValidationException ||
            $e instanceof FileUploadException ||
            $e instanceof OcrProcessingException ||
            $e instanceof RepositoryException ||
            $e instanceof ServiceException ||
            $e instanceof BusinessRuleException
        ) {
            return $e->render();
        }

        if ($e instanceof ValidationException) {
            return ApiException::badRequest(
                'The given data was invalid.',
                $e->errors()
            )->render();
        }

        if ($e instanceof AuthenticationException) {
            return ApiException::unauthorized()->render();
        }

        if ($e instanceof AuthorizationException) {
            return ApiException::forbidden()->render();
        }

        if ($e instanceof ModelNotFoundException) {
            return ApiException::notFound(
                class_basename($e->getModel()),
                $e->getIds()[0] ?? null
            )->render();
        }

        if ($e instanceof TokenExpiredException) {
            return ApiException::unauthorized('Token has expired.')->render();
        }

        if ($e instanceof TokenInvalidException) {
            return ApiException::unauthorized('Token is invalid.')->render();
        }

        if ($e instanceof JWTException) {
            return ApiException::unauthorized('Token is missing or malformed.')->render();
        }

        if ($e instanceof HttpException) {
            return ApiException::badRequest(
                $e->getMessage(),
                [],
                null,
                $e->getStatusCode()
            )->render();
        }

        // Handle any other exceptions
        if (config('app.debug')) {
            return ApiException::serverError(
                $e->getMessage(),
                [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTrace(),
                ]
            )->render();
        }

        return ApiException::serverError()->render();
    }
}
