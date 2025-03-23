<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Models\Category;
use App\Domain\Repositories\Interfaces\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CategoryRepository extends BaseRepository implements CategoryRepositoryInterface
{
    protected function createModel(): Model
    {
        return new Category();
    }

    public function findByUser(int $userId): Collection
    {
        return $this->findBy(['user_id' => $userId]);
    }

    public function findSystemCategories(): Collection
    {
        return $this->findBy(['is_system' => true]);
    }

    public function findUserCategories(int $userId): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('is_system', false)
            ->orderBy('name')
            ->get();
    }

    public function findWithTransactionCount(int $userId): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->withCount('transactions')
            ->orderBy('name')
            ->get();
    }

    public function createForUser(int $userId, array $data): Category
    {
        $data['user_id'] = $userId;
        $data['is_system'] = false;
        return $this->create($data);
    }

    public function findByName(int $userId, string $name): ?Category
    {
        return $this->findOneBy([
            'user_id' => $userId,
            'name' => $name
        ]);
    }

    public function getTransactionStats(int $userId, int $categoryId): array
    {
        $stats = $this->model
            ->join('transactions', 'categories.id', '=', 'transactions.category_id')
            ->where('categories.id', $categoryId)
            ->where('categories.user_id', $userId)
            ->select(
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('SUM(transactions.amount) as total_amount'),
                DB::raw('AVG(transactions.amount) as average_amount'),
                DB::raw('MIN(transactions.amount) as min_amount'),
                DB::raw('MAX(transactions.amount) as max_amount')
            )
            ->first();

        return $stats ? $stats->toArray() : [
            'total_transactions' => 0,
            'total_amount' => 0,
            'average_amount' => 0,
            'min_amount' => 0,
            'max_amount' => 0
        ];
    }

    public function getMostUsedCategories(int $userId, int $limit = 5): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->withCount('transactions')
            ->orderByDesc('transactions_count')
            ->limit($limit)
            ->get();
    }

    public function getCategoryDistribution(int $userId, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = $this->model
            ->join('transactions', 'categories.id', '=', 'transactions.category_id')
            ->where('categories.user_id', $userId)
            ->select(
                'categories.name',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(transactions.amount) as total_amount')
            )
            ->groupBy('categories.id', 'categories.name');

        if ($startDate && $endDate) {
            $query->whereBetween('transactions.transaction_date', [$startDate, $endDate]);
        }

        return $query->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'transaction_count' => $item->transaction_count,
                    'total_amount' => $item->total_amount,
                    'percentage' => 0 // Will be calculated in the service layer
                ];
            })
            ->toArray();
    }

    public function bulkUpdateTransactions(int $fromCategoryId, int $toCategoryId): bool
    {
        return DB::transaction(function () use ($fromCategoryId, $toCategoryId) {
            $updated = DB::table('transactions')
                ->where('category_id', $fromCategoryId)
                ->update(['category_id' => $toCategoryId]);

            return $updated > 0;
        });
    }
}
