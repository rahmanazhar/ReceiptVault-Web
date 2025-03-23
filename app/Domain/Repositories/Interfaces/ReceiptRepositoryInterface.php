<?php

namespace App\Domain\Repositories\Interfaces;

use App\Domain\Models\Receipt;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ReceiptRepositoryInterface extends RepositoryInterface
{
    public function findByUser(int $userId): Collection;
    
    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator;
    
    public function findByStatus(string $status): Collection;
    
    public function updateStatus(int $id, string $status): Receipt;
    
    public function findByDateRange(int $userId, string $startDate, string $endDate): Collection;
    
    public function findPendingOcrProcessing(): Collection;
    
    public function updateOcrData(int $id, array $ocrData): Receipt;
    
    public function findByMerchant(int $userId, string $merchantName): Collection;
    
    public function getTotalAmountByDateRange(int $userId, string $startDate, string $endDate): float;
}
