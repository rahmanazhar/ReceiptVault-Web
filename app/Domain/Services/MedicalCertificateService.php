<?php

namespace App\Domain\Services;

use App\Domain\Models\MedicalCertificate;
use App\Domain\Repositories\Interfaces\MedicalCertificateRepositoryInterface;
use App\Jobs\ProcessMedicalCertificateWithAi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MedicalCertificateService
{
    protected MedicalCertificateRepositoryInterface $repository;

    public function __construct(MedicalCertificateRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function uploadMedicalCertificate(int $userId, UploadedFile $file, array $metadata = []): MedicalCertificate
    {
        $path = $this->storeMedicalCertificateImage($file);

        $mc = $this->repository->create([
            'user_id' => $userId,
            'image_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'source' => $metadata['source'] ?? 'upload',
            'status' => 'pending',
        ]);

        ProcessMedicalCertificateWithAi::dispatchSync($mc->id);

        return $mc;
    }

    public function getMedicalCertificateDetails(int $mcId): array
    {
        $mc = $this->repository->findOrFail($mcId);

        return [
            'medical_certificate' => $mc,
            'image_url' => Storage::url($mc->image_path),
        ];
    }

    public function updateMedicalCertificate(int $mcId, array $data): MedicalCertificate
    {
        $mc = $this->repository->findOrFail($mcId);

        if (isset($data['image'])) {
            if ($mc->image_path) {
                Storage::disk('public')->delete($mc->image_path);
            }

            $data['image_path'] = $this->storeMedicalCertificateImage($data['image']);
            unset($data['image']);
        }

        return $this->repository->update($data, $mcId);
    }

    public function deleteMedicalCertificate(int $mcId): bool
    {
        $mc = $this->repository->findOrFail($mcId);

        Storage::disk('public')->delete($mc->image_path);

        return $this->repository->delete($mcId);
    }

    protected function storeMedicalCertificateImage(UploadedFile $file): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('medical-certificates', $filename, 'public');

        return $path;
    }
}
