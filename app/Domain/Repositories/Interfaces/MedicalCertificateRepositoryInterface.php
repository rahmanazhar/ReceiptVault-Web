<?php

namespace App\Domain\Repositories\Interfaces;

use App\Domain\Models\MedicalCertificate;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface MedicalCertificateRepositoryInterface extends RepositoryInterface
{
    public function findByUser(int $userId): Collection;

    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator;

    public function findByStatus(string $status): Collection;

    public function updateStatus(int $id, string $status): MedicalCertificate;

    public function findByDateRange(int $userId, string $startDate, string $endDate): Collection;

    public function findPendingOcrProcessing(): Collection;

    public function updateOcrData(int $id, array $ocrData): MedicalCertificate;

    public function findByClinic(int $userId, string $clinicName): Collection;
}
