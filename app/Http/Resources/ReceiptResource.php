<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'merchant_name' => $this->merchant_name,
            'total_amount' => $this->total_amount,
            'purchase_date' => $this->purchase_date->format('Y-m-d'),
            'status' => $this->status,
            'image_url' => $this->when($this->image_path, function () {
                return url('storage/' . $this->image_path);
            }),
            'ocr_data' => $this->when($this->ocr_data, fn() => $this->ocr_data),
            'transactions_count' => $this->when(
                $this->transactions_count,
                fn() => $this->transactions_count
            ),
            'transactions' => TransactionResource::collection(
                $this->whenLoaded('transactions')
            ),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
