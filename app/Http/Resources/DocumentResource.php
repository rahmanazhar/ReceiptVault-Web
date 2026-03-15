<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'document_type' => $this->document_type,
            'title' => $this->title,
            'sender' => $this->sender,
            'recipient' => $this->recipient,
            'reference_number' => $this->reference_number,
            'issue_date' => $this->issue_date?->format('Y-m-d'),
            'expiry_date' => $this->expiry_date?->format('Y-m-d'),
            'description' => $this->description,
            'notes' => $this->notes,
            'status' => $this->status,
            'ai_confidence_score' => $this->ai_confidence_score,
            'image_url' => $this->when($this->image_path, function () {
                return url('storage/' . $this->image_path);
            }),
            'ocr_data' => $this->when($this->ocr_data, fn() => $this->ocr_data),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
