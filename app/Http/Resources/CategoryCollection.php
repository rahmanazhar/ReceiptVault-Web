<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total_count' => $this->collection->count(),
                'system_categories_count' => $this->collection
                    ->where('is_system', true)
                    ->count(),
                'user_categories_count' => $this->collection
                    ->where('is_system', false)
                    ->count(),
                'categories_with_transactions' => $this->collection
                    ->filter(fn($category) => $category->transactions_count > 0)
                    ->count(),
                'total_transactions' => $this->collection->sum('transactions_count'),
                'distribution' => $this->collection
                    ->mapWithKeys(function ($category) {
                        return [
                            $category->id => [
                                'name' => $category->name,
                                'transaction_count' => $category->transactions_count ?? 0,
                                'total_amount' => $category->total_amount ?? 0,
                                'percentage' => $this->calculatePercentage(
                                    $category->total_amount ?? 0,
                                    $this->collection->sum('total_amount')
                                )
                            ]
                        ];
                    })
            ]
        ];
    }

    protected function calculatePercentage(float $amount, float $total): float
    {
        if ($total <= 0) {
            return 0;
        }

        return round(($amount / $total) * 100, 2);
    }
}
