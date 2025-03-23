<?php

namespace App\Domain\Services;

use App\Domain\Models\Transaction;
use App\Domain\Repositories\Interfaces\TransactionRepositoryInterface;
use App\Domain\Repositories\Interfaces\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class TransactionService
{
    protected TransactionRepositoryInterface $transactionRepository;
    protected CategoryRepositoryInterface $categoryRepository;

    public function __construct(
        TransactionRepositoryInterface $transactionRepository,
        CategoryRepositoryInterface $categoryRepository
    ) {
        $this->transactionRepository = $transactionRepository;
        $this->categoryRepository = $categoryRepository;
    }

    public function createTransaction(int $userId, array $data): Transaction
    {
        // Ensure user_id is set
        $data['user_id'] = $userId;

        // Handle category assignment
        if (isset($data['category_name']) && !isset($data['category_id'])) {
            $category = $this->categoryRepository->findByName($userId, $data['category_name']);
            if ($category) {
                $data['category_id'] = $category->id;
            }
            unset($data['category_name']);
        }

        return $this->transactionRepository->create($data);
    }

    public function updateTransaction(int $transactionId, array $data): Transaction
    {
        return $this->transactionRepository->update($data, $transactionId);
    }

    public function getTransactionsPaginated(int $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        // Apply filters if provided
        if (!empty($filters)) {
            // Date range filter
            if (isset($filters['start_date']) && isset($filters['end_date'])) {
                $query = $this->transactionRepository->model
                    ->where('user_id', $userId)
                    ->whereBetween('transaction_date', [
                        $filters['start_date'],
                        $filters['end_date']
                    ]);
                return $query->paginate($perPage);
            }

            // Category filter
            if (isset($filters['category_id'])) {
                $query = $this->transactionRepository->model
                    ->where('user_id', $userId)
                    ->where('category_id', $filters['category_id']);
                return $query->paginate($perPage);
            }

            // Tax deductible filter
            if (isset($filters['tax_deductible']) && $filters['tax_deductible']) {
                $query = $this->transactionRepository->model
                    ->where('user_id', $userId)
                    ->where('is_tax_deductible', true);
                
                if (isset($filters['tax_category'])) {
                    $query->where('tax_category', $filters['tax_category']);
                }
                
                return $query->paginate($perPage);
            }
        }

        return $this->transactionRepository->paginateByUser($userId, $perPage);
    }

    public function categorizeTransaction(int $transactionId, int $categoryId): Transaction
    {
        return $this->transactionRepository->updateCategory($transactionId, $categoryId);
    }

    public function bulkCategorizeTransactions(array $transactionIds, int $categoryId): bool
    {
        $success = true;
        foreach ($transactionIds as $id) {
            try {
                $this->categorizeTransaction($id, $categoryId);
            } catch (\Exception $e) {
                $success = false;
                // Log error but continue processing
                Log::error("Failed to categorize transaction {$id}: " . $e->getMessage());
            }
        }
        return $success;
    }

    public function getTransactionStats(int $userId): array
    {
        $currentYear = date('Y');
        $currentMonth = date('m');

        return [
            'monthly_totals' => $this->transactionRepository->getMonthlyTotals($userId, $currentYear),
            'tax_deductible_total' => $this->transactionRepository->getTaxDeductibleTotal($userId, $currentYear),
            'category_distribution' => $this->categoryRepository->getCategoryDistribution($userId),
            'uncategorized_count' => $this->transactionRepository->findUncategorized($userId)->count(),
        ];
    }

    public function searchTransactions(int $userId, string $query): Collection
    {
        return $this->transactionRepository->search($userId, $query);
    }

    public function getTaxReport(int $userId, string $year): array
    {
        $taxDeductibleTransactions = $this->transactionRepository->findTaxDeductible($userId);
        $totalDeductible = $this->transactionRepository->getTaxDeductibleTotal($userId, $year);

        $categorizedDeductions = $taxDeductibleTransactions->groupBy('tax_category')
            ->map(function ($transactions) {
                return [
                    'count' => $transactions->count(),
                    'total' => $transactions->sum('amount')
                ];
            });

        return [
            'total_deductible' => $totalDeductible,
            'categorized_deductions' => $categorizedDeductions,
            'transactions' => $taxDeductibleTransactions
        ];
    }

    public function deleteTransaction(int $transactionId): bool
    {
        return $this->transactionRepository->delete($transactionId);
    }
}
