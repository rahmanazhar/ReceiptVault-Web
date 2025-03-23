<?php

namespace App\Domain\Repositories\Interfaces;

use App\Domain\Models\Transaction;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface TransactionRepositoryInterface extends RepositoryInterface
{
    public function findByUser(int $userId): Collection;
    
    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator;
    
    public function findByCategory(int $userId, int $categoryId): Collection;
    
    public function findByReceipt(int $receiptId): Collection;
    
    public function findByDateRange(int $userId, string $startDate, string $endDate): Collection;
    
    public function findTaxDeductible(int $userId, ?string $taxCategory = null): Collection;
    
    public function updateCategory(int $id, int $categoryId): Transaction;
    
    public function getTotalByCategory(int $userId, int $categoryId, ?string $startDate = null, ?string $endDate = null): float;
    
    public function getTotalByDateRange(int $userId, string $startDate, string $endDate): float;
    
    public function search(int $userId, string $query): Collection;
    
    public function findUncategorized(int $userId): Collection;
    
    public function getMonthlyTotals(int $userId, int $year): array;
    
    public function getTaxDeductibleTotal(int $userId, string $year): float;
}
