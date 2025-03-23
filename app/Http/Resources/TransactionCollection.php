<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class TransactionCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total_amount' => $this->collection->sum('amount'),
                'total_count' => $this->collection->count(),
                'tax_deductible_amount' => $this->collection
                    ->where('is_tax_deductible', true)
                    ->sum('amount'),
                'tax_deductible_count' => $this->collection
                    ->where('is_tax_deductible', true)
                    ->count(),
                'categorized_count' => $this->collection
                    ->whereNotNull('category_id')
                    ->count(),
                'uncategorized_count' => $this->collection
                    ->whereNull('category_id')
                    ->count(),
                'categories' => $this->collection
                    ->groupBy('category_id')
                    ->map(function ($transactions) {
                        return [
                            'count' => $transactions->count(),
                            'total_amount' => $transactions->sum('amount')
                        ];
                    }),
            ],
        ];
    }
}
