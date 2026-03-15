<?php

namespace App\Domain\Services;

use App\Domain\Models\Document;
use App\Domain\Repositories\Interfaces\DocumentRepositoryInterface;
use App\Jobs\ProcessDocumentWithAi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentService
{
    protected DocumentRepositoryInterface $repository;

    public function __construct(DocumentRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function uploadDocument(int $userId, UploadedFile $file, array $metadata = []): Document
    {
        $path = $this->storeDocumentImage($file);

        $document = $this->repository->create([
            'user_id' => $userId,
            'image_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'source' => $metadata['source'] ?? 'upload',
            'status' => 'pending',
        ]);

        ProcessDocumentWithAi::dispatchSync($document->id);

        return $document;
    }

    public function getDocumentDetails(int $documentId): array
    {
        $document = $this->repository->findOrFail($documentId);

        return [
            'document' => $document,
            'image_url' => Storage::url($document->image_path),
        ];
    }

    public function updateDocument(int $documentId, array $data): Document
    {
        $document = $this->repository->findOrFail($documentId);

        if (isset($data['image'])) {
            if ($document->image_path) {
                Storage::disk('public')->delete($document->image_path);
            }

            $data['image_path'] = $this->storeDocumentImage($data['image']);
            unset($data['image']);
        }

        return $this->repository->update($data, $documentId);
    }

    public function deleteDocument(int $documentId): bool
    {
        $document = $this->repository->findOrFail($documentId);

        Storage::disk('public')->delete($document->image_path);

        return $this->repository->delete($documentId);
    }

    protected function storeDocumentImage(UploadedFile $file): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('documents', $filename, 'public');

        return $path;
    }
}
