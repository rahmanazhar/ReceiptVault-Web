<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Models\Transaction;
use App\Domain\Repositories\Interfaces\TransactionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class TransactionRepository extends BaseRepository implements TransactionRepositoryInterface
{
    protected function createModel(): Model
    {
        return new Transaction();
    }

    public function findByUser(int $userId): Collection
    {
        return $this->findBy(['user_id' => $userId]);
    }

    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->where('user_id', $userId)
            ->with(['category', 'receipt'])
            ->orderBy('transaction_date', 'desc')
            ->paginate($perPage);
    }

    public function findByCategory(int $userId, int $categoryId): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->orderBy('transaction_date', 'desc')
            ->get();
    }

    public function findByReceipt(int $receiptId): Collection
    {
        return $this->findBy(['receipt_id' => $receiptId]);
    }

    public function findByDateRange(int $userId, string $startDate, string $endDate): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->orderBy('transaction_date', 'desc')
            ->get();
    }

    public function findTaxDeductible(int $userId, ?string $taxCategory = null): Collection
    {
        $query = $this->model
            ->where('user_id', $userId)
            ->where('is_tax_deductible', true);

        if ($taxCategory) {
            $query->where('tax_category', $taxCategory);
        }

        return $query->orderBy('transaction_date', 'desc')->get();
    }

    public function updateCategory(int $id, int $categoryId): Transaction
    {
        return $this->update(['category_id' => $categoryId], $id);
    }

    public function getTotalByCategory(int $userId, int $categoryId, ?string $startDate = null, ?string $endDate = null): float
    {
        $query = $this->model
            ->where('user_id', $userId)
            ->where('category_id', $categoryId);

        if ($startDate && $endDate) {
            $query->whereBetween('transaction_date', [$startDate, $endDate]);
        }

        return $query->sum('amount');
    }

    public function getTotalByDateRange(int $userId, string $startDate, string $endDate): float
    {
        return $this->model
            ->where('user_id', $userId)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');
    }

    public function search(int $userId, string $query): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->where(function ($q) use ($query) {
                $q->where('description', 'LIKE', "%{$query}%")
                    ->orWhere('notes', 'LIKE', "%{$query}%")
                    ->orWhere('tax_category', 'LIKE', "%{$query}%");
            })
            ->orderBy('transaction_date', 'desc')
            ->get();
    }

    public function findUncategorized(int $userId): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->whereNull('category_id')
            ->orderBy('transaction_date', 'desc')
            ->get();
    }

    public function getMonthlyTotals(int $userId, int $year): array
    {
        return $this->model
            ->select(
                DB::raw('MONTH(transaction_date) as month'),
                DB::raw('SUM(amount) as total')
            )
            ->where('user_id', $userId)
            ->whereYear('transaction_date', $year)
            ->groupBy(DB::raw('MONTH(transaction_date)'))
            ->orderBy('month')
            ->get()
            ->pluck('total', 'month')
            ->toArray();
    }

    public function getTaxDeductibleTotal(int $userId, string $year): float
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('is_tax_deductible', true)
            ->whereYear('transaction_date', $year)
            ->sum('amount');
    }
}
