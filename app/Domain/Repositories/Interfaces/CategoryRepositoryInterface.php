<?php

namespace App\Domain\Repositories\Interfaces;

use App\Domain\Models\Category;
use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface extends RepositoryInterface
{
    public function findByUser(int $userId): Collection;
    
    public function findSystemCategories(): Collection;
    
    public function findUserCategories(int $userId): Collection;
    
    public function findWithTransactionCount(int $userId): Collection;
    
    public function createForUser(int $userId, array $data): Category;
    
    public function findByName(int $userId, string $name): ?Category;
    
    public function getTransactionStats(int $userId, int $categoryId): array;
    
    public function getMostUsedCategories(int $userId, int $limit = 5): Collection;
    
    public function getCategoryDistribution(int $userId, ?string $startDate = null, ?string $endDate = null): array;
    
    public function bulkUpdateTransactions(int $fromCategoryId, int $toCategoryId): bool;
}
