<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Models\MedicalCertificate;
use App\Domain\Repositories\Interfaces\MedicalCertificateRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class MedicalCertificateRepository extends BaseRepository implements MedicalCertificateRepositoryInterface
{
    protected function createModel(): Model
    {
        return new MedicalCertificate();
    }

    public function findByUser(int $userId): Collection
    {
        return $this->findBy(['user_id' => $userId]);
    }

    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function findByStatus(string $status): Collection
    {
        return $this->findBy(['status' => $status]);
    }

    public function updateStatus(int $id, string $status): MedicalCertificate
    {
        return $this->update(['status' => $status], $id);
    }

    public function findByDateRange(int $userId, string $startDate, string $endDate): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->whereBetween('mc_start_date', [$startDate, $endDate])
            ->orderBy('mc_start_date', 'desc')
            ->get();
    }

    public function findPendingOcrProcessing(): Collection
    {
        return $this->findBy(['status' => 'pending']);
    }

    public function updateOcrData(int $id, array $ocrData): MedicalCertificate
    {
        return $this->update([
            'ocr_data' => $ocrData,
            'status' => 'completed'
        ], $id);
    }

    public function findByClinic(int $userId, string $clinicName): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('clinic_name', 'LIKE', "%{$clinicName}%")
            ->orderBy('mc_start_date', 'desc')
            ->get();
    }
}
