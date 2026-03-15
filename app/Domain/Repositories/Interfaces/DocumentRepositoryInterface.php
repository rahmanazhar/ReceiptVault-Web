<?php

namespace App\Domain\Repositories\Interfaces;

use App\Domain\Models\Document;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface DocumentRepositoryInterface extends RepositoryInterface
{
    public function findByUser(int $userId): Collection;

    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator;

    public function findByStatus(string $status): Collection;

    public function updateStatus(int $id, string $status): Document;

    public function findByDateRange(int $userId, string $startDate, string $endDate): Collection;

    public function findPendingOcrProcessing(): Collection;

    public function updateOcrData(int $id, array $ocrData): Document;

    public function findByDocumentType(int $userId, string $documentType): Collection;

    public function findExpiringDocuments(int $userId, string $beforeDate): Collection;
}
