<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'receipt_id' => $this->receipt_id,
            'category_id' => $this->category_id,
            'description' => $this->description,
            'amount' => $this->amount,
            'transaction_date' => $this->transaction_date->format('Y-m-d'),
            'is_tax_deductible' => $this->is_tax_deductible,
            'tax_category' => $this->tax_category,
            'notes' => $this->notes,
            'metadata' => $this->metadata,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'receipt' => new ReceiptResource($this->whenLoaded('receipt')),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
