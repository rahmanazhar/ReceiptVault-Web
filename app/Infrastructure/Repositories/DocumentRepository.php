<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Models\Document;
use App\Domain\Repositories\Interfaces\DocumentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class DocumentRepository extends BaseRepository implements DocumentRepositoryInterface
{
    protected function createModel(): Model
    {
        return new Document();
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

    public function updateStatus(int $id, string $status): Document
    {
        return $this->update(['status' => $status], $id);
    }

    public function findByDateRange(int $userId, string $startDate, string $endDate): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->orderBy('issue_date', 'desc')
            ->get();
    }

    public function findPendingOcrProcessing(): Collection
    {
        return $this->findBy(['status' => 'pending']);
    }

    public function updateOcrData(int $id, array $ocrData): Document
    {
        return $this->update([
            'ocr_data' => $ocrData,
            'status' => 'completed'
        ], $id);
    }

    public function findByDocumentType(int $userId, string $documentType): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('document_type', $documentType)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findExpiringDocuments(int $userId, string $beforeDate): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', $beforeDate)
            ->orderBy('expiry_date', 'asc')
            ->get();
    }
}
