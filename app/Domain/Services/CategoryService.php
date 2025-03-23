<?php

namespace App\Domain\Services;

use App\Domain\Models\Category;
use App\Domain\Repositories\Interfaces\CategoryRepositoryInterface;
use App\Domain\Repositories\Interfaces\TransactionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CategoryService
{
    protected CategoryRepositoryInterface $categoryRepository;
    protected TransactionRepositoryInterface $transactionRepository;

    public function __construct(
        CategoryRepositoryInterface $categoryRepository,
        TransactionRepositoryInterface $transactionRepository
    ) {
        $this->categoryRepository = $categoryRepository;
        $this->categoryRepository = $categoryRepository;
        $this->transactionRepository = $transactionRepository;
    }

    public function createCategory(int $userId, array $data): Category
    {
        // Check if category with same name exists
        if ($this->categoryRepository->findByName($userId, $data['name'])) {
            throw new \InvalidArgumentException('Category with this name already exists');
        }

        return $this->categoryRepository->createForUser($userId, $data);
    }

    public function updateCategory(int $categoryId, array $data): Category
    {
        return $this->categoryRepository->update($data, $categoryId);
    }

    public function deleteCategory(int $categoryId, ?int $transferToCategoryId = null): bool
    {
        if ($transferToCategoryId) {
            // Transfer transactions to another category before deletion
            $this->categoryRepository->bulkUpdateTransactions($categoryId, $transferToCategoryId);
        }

        return $this->categoryRepository->delete($categoryId);
    }

    public function getUserCategories(int $userId): Collection
    {
        return $this->categoryRepository->findUserCategories($userId);
    }

    public function getCategoryAnalytics(int $userId, int $categoryId): array
    {
        $stats = $this->categoryRepository->getTransactionStats($userId, $categoryId);
        $category = $this->categoryRepository->findOrFail($categoryId);

        return [
            'category' => $category,
            'transaction_count' => $stats['total_transactions'],
            'total_amount' => $stats['total_amount'],
            'average_amount' => $stats['average_amount'],
            'min_amount' => $stats['min_amount'],
            'max_amount' => $stats['max_amount']
        ];
    }

    public function getSpendingDistribution(int $userId, ?string $startDate = null, ?string $endDate = null): array
    {
        $distribution = $this->categoryRepository->getCategoryDistribution($userId, $startDate, $endDate);
        
        // Calculate total amount for percentage calculations
        $totalAmount = array_sum(array_column($distribution, 'total_amount'));
        
        // Add percentage to each category
        return array_map(function ($item) use ($totalAmount) {
            $item['percentage'] = $totalAmount > 0 
                ? round(($item['total_amount'] / $totalAmount) * 100, 2)
                : 0;
            return $item;
        }, $distribution);
    }

    public function getMostUsedCategories(int $userId): Collection
    {
        return $this->categoryRepository->getMostUsedCategories($userId);
    }

    public function getMonthlySpendingByCategory(int $userId, int $categoryId, int $months = 12): array
    {
        $endDate = now();
        $startDate = $endDate->copy()->subMonths($months);

        return DB::table('transactions')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->where('transactions.category_id', $categoryId)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE_FORMAT(transaction_date, "%Y-%m") as month'),
                DB::raw('SUM(amount) as total_amount'),
                DB::raw('COUNT(*) as transaction_count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->mapWithKeys(function ($item) {
                return [
                    $item->month => [
                        'total_amount' => $item->total_amount,
                        'transaction_count' => $item->transaction_count
                    ]
                ];
            })
            ->toArray();
    }

    public function suggestCategory(int $userId, string $transactionDescription): ?Category
    {
        // Find similar transactions by description and get their categories
        $similarTransactions = $this->transactionRepository->search($userId, $transactionDescription);
        
        if ($similarTransactions->isEmpty()) {
            return null;
        }

        // Get the most common category among similar transactions
        $categoryFrequency = $similarTransactions
            ->where('category_id', '!=', null)
            ->groupBy('category_id')
            ->map->count();

        if ($categoryFrequency->isEmpty()) {
            return null;
        }

        $mostCommonCategoryId = $categoryFrequency->sortDesc()->keys()->first();
        return $this->categoryRepository->find($mostCommonCategoryId);
    }

    public function initializeSystemCategories(): void
    {
        $defaultCategories = [
            ['name' => 'Food & Dining', 'color' => '#FF5733'],
            ['name' => 'Transportation', 'color' => '#33FF57'],
            ['name' => 'Shopping', 'color' => '#3357FF'],
            ['name' => 'Bills & Utilities', 'color' => '#FF33F5'],
            ['name' => 'Entertainment', 'color' => '#33FFF5'],
            ['name' => 'Healthcare', 'color' => '#F5FF33'],
            ['name' => 'Travel', 'color' => '#FF3333'],
            ['name' => 'Business', 'color' => '#33FF33']
        ];

        foreach ($defaultCategories as $category) {
            $this->categoryRepository->create([
                'name' => $category['name'],
                'color' => $category['color'],
                'is_system' => true
            ]);
        }
    }
}
