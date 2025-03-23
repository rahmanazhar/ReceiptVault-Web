<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

class FileUploadException extends BaseException
{
    protected ?UploadedFile $uploadedFile;

    public function __construct(
        string $message = 'File upload failed',
        ?UploadedFile $file = null,
        array $errors = [],
        string $intendedPath = '',
        int $code = Response::HTTP_UNPROCESSABLE_ENTITY,
        ?Exception $previous = null
    ) {
        $this->uploadedFile = $file;

        $context = [
            'errors' => $errors,
            'intended_path' => $intendedPath,
        ];

        if ($file) {
            $context['file'] = [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension(),
                'error_code' => $file->getError(),
            ];
        }

        parent::__construct(
            $message,
            $context,
            'file_upload_error',
            'UPLOAD_FAILED',
            $code,
            $previous
        );
    }

    public static function invalidFile(UploadedFile $file, array $errors = []): self
    {
        return new static(
            'Invalid file upload',
            $file,
            $errors,
            '',
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function storageFailed(UploadedFile $file, string $path, array $errors = []): self
    {
        return new static(
            'Failed to store uploaded file',
            $file,
            $errors,
            $path,
            Response::HTTP_INTERNAL_SERVER_ERROR
        );
    }

    public static function sizeLimitExceeded(UploadedFile $file, int $maxSize): self
    {
        return new static(
            "File size exceeds limit of {$maxSize} bytes",
            $file,
            ['max_size' => $maxSize, 'actual_size' => $file->getSize()],
            '',
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function invalidMimeType(UploadedFile $file, array $allowedTypes): self
    {
        return new static(
            'Invalid file type',
            $file,
            [
                'mime_type' => $file->getMimeType(),
                'allowed_types' => $allowedTypes
            ],
            '',
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    public static function diskSpaceExceeded(UploadedFile $file, string $disk): self
    {
        return new static(
            "Insufficient disk space on '{$disk}'",
            $file,
            ['disk' => $disk],
            '',
            Response::HTTP_INSUFFICIENT_STORAGE
        );
    }
}
