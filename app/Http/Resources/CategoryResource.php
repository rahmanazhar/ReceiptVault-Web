<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'description' => $this->description,
            'color' => $this->color,
            'is_system' => $this->is_system,
            'transactions_count' => $this->when(
                $this->transactions_count,
                fn() => $this->transactions_count
            ),
            'total_amount' => $this->when(
                $this->total_amount,
                fn() => $this->total_amount
            ),
            'transactions' => TransactionResource::collection(
                $this->whenLoaded('transactions')
            ),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
