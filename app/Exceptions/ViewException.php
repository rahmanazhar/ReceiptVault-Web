<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class ViewException extends BaseException
{
    protected string $view;
    protected ?string $component;

    public function __construct(
        string $message = 'View rendering failed',
        string $view = '',
        ?string $component = null,
        array $context = [],
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
        ?Exception $previous = null
    ) {
        $this->view = $view;
        $this->component = $component;

        $context = array_merge([
            'view' => $view,
            'component' => $component,
        ], $context);

        parent::__construct(
            $message,
            $context,
            'view_error',
            'VIEW_ERROR',
            $code,
            $previous
        );
    }

    public static function viewNotFound(
        string $view,
        array $context = []
    ): self {
        return new static(
            "View '{$view}' not found",
            $view,
            null,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function componentNotFound(
        string $view,
        string $component,
        array $context = []
    ): self {
        return new static(
            "Component '{$component}' not found in view '{$view}'",
            $view,
            $component,
            $context,
            Response::HTTP_NOT_FOUND
        );
    }

    public static function invalidSyntax(
        string $view,
        string $error,
        array $context = []
    ): self {
        return new static(
            "Syntax error in view '{$view}': {$error}",
            $view,
            null,
            array_merge(['error' => $error], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function missingData(
        string $view,
        array $missing,
        array $context = []
    ): self {
        $fields = implode("', '", $missing);
        return new static(
            "Missing required data in view '{$view}': '{$fields}'",
            $view,
            null,
            array_merge(['missing_fields' => $missing], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function invalidData(
        string $view,
        array $errors,
        array $context = []
    ): self {
        return new static(
            "Invalid data provided to view '{$view}'",
            $view,
            null,
            array_merge(['errors' => $errors], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function renderingFailed(
        string $view,
        string $reason,
        array $context = []
    ): self {
        return new static(
            "Failed to render view '{$view}': {$reason}",
            $view,
            null,
            $context
        );
    }

    public static function componentError(
        string $view,
        string $component,
        string $error,
        array $context = []
    ): self {
        return new static(
            "Error in component '{$component}': {$error}",
            $view,
            $component,
            array_merge(['error' => $error], $context)
        );
    }

    public static function layoutNotFound(
        string $view,
        string $layout,
        array $context = []
    ): self {
        return new static(
            "Layout '{$layout}' not found for view '{$view}'",
            $view,
            null,
            array_merge(['layout' => $layout], $context),
            Response::HTTP_NOT_FOUND
        );
    }

    public static function composerError(
        string $view,
        string $composer,
        string $error,
        array $context = []
    ): self {
        return new static(
            "View composer '{$composer}' failed: {$error}",
            $view,
            null,
            array_merge(['composer' => $composer], $context)
        );
    }

    public static function invalidExtension(
        string $view,
        string $extension,
        array $allowedExtensions,
        array $context = []
    ): self {
        $allowed = implode("', '", $allowedExtensions);
        return new static(
            "Invalid view extension '{$extension}'. Allowed: '{$allowed}'",
            $view,
            null,
            array_merge([
                'extension' => $extension,
                'allowed_extensions' => $allowedExtensions
            ], $context),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function circularDependency(
        string $view,
        array $chain,
        array $context = []
    ): self {
        $path = implode(' -> ', $chain);
        return new static(
            "Circular dependency detected in view includes: {$path}",
            $view,
            null,
            array_merge(['dependency_chain' => $chain], $context)
        );
    }
}
