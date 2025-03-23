<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Models\Receipt;
use App\Domain\Repositories\Interfaces\ReceiptRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class ReceiptRepository extends BaseRepository implements ReceiptRepositoryInterface
{
    protected function createModel(): Model
    {
        return new Receipt();
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

    public function updateStatus(int $id, string $status): Receipt
    {
        return $this->update(['status' => $status], $id);
    }

    public function findByDateRange(int $userId, string $startDate, string $endDate): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->orderBy('purchase_date', 'desc')
            ->get();
    }

    public function findPendingOcrProcessing(): Collection
    {
        return $this->findBy(['status' => 'pending']);
    }

    public function updateOcrData(int $id, array $ocrData): Receipt
    {
        return $this->update([
            'ocr_data' => $ocrData,
            'status' => 'completed'
        ], $id);
    }

    public function findByMerchant(int $userId, string $merchantName): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('merchant_name', 'LIKE', "%{$merchantName}%")
            ->orderBy('purchase_date', 'desc')
            ->get();
    }

    public function getTotalAmountByDateRange(int $userId, string $startDate, string $endDate): float
    {
        return $this->model
            ->where('user_id', $userId)
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->sum('total_amount');
    }
}
