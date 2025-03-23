<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationRuleParser;
use Symfony\Component\HttpFoundation\Response;

class ValidationException extends BaseException
{
    protected Validator $validator;
    protected array $customMessages;

    public function __construct(
        Validator $validator,
        array $customMessages = [],
        string $message = 'The given data was invalid.',
        int $code = Response::HTTP_UNPROCESSABLE_ENTITY,
        ?Exception $previous = null
    ) {
        $this->validator = $validator;
        $this->customMessages = $customMessages;

        $context = [
            'validation_errors' => $this->formatErrors(),
            'failed_rules' => $validator->failed(),
        ];

        parent::__construct(
            $message,
            $context,
            'validation_error',
            'VALIDATION_FAILED',
            $code,
            $previous
        );
    }

    protected function formatErrors(): array
    {
        $errors = $this->validator->errors()->messages();

        // Apply any custom error messages
        foreach ($this->customMessages as $field => $message) {
            if (isset($errors[$field])) {
                $errors[$field] = array_map(
                    fn() => $message,
                    $errors[$field]
                );
            }
        }

        return $errors;
    }

    public static function withCustomMessages(
        Validator $validator,
        array $customMessages
    ): self {
        return new static($validator, $customMessages);
    }

    public static function withMessage(
        Validator $validator,
        string $message
    ): self {
        return new static($validator, [], $message);
    }

    public static function fromArray(
        array $errors,
        string $message = 'Validation failed'
    ): self {
        $validator = app('validator')->make([], []); // Empty validator
        $validator->errors()->merge($errors);

        return new static($validator, [], $message);
    }

    public static function fromError(
        string $field,
        string $message
    ): self {
        return static::fromArray([$field => [$message]]);
    }

    public static function fromRuleViolation(
        string $rule,
        array $parameters = [],
        string $message = null
    ): self {
        $message = $message ?? "Validation rule '{$rule}' was violated";
        
        return new static(
            app('validator')->make([], []),
            [],
            $message,
            Response::HTTP_UNPROCESSABLE_ENTITY,
            null
        );
    }
}
