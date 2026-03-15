<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class MedicalCertificateCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total_count' => $this->collection->count(),
                'pending_count' => $this->collection->where('status', 'pending')->count(),
                'processing_count' => $this->collection->where('status', 'processing')->count(),
                'completed_count' => $this->collection->where('status', 'completed')->count(),
                'failed_count' => $this->collection->where('status', 'failed')->count(),
            ],
        ];
    }
}
