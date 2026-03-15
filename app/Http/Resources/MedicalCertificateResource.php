<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicalCertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'patient_name' => $this->patient_name,
            'doctor_name' => $this->doctor_name,
            'clinic_name' => $this->clinic_name,
            'diagnosis' => $this->diagnosis,
            'mc_start_date' => $this->mc_start_date?->format('Y-m-d'),
            'mc_end_date' => $this->mc_end_date?->format('Y-m-d'),
            'mc_days' => $this->mc_days,
            'mc_number' => $this->mc_number,
            'issue_date' => $this->issue_date?->format('Y-m-d'),
            'doctor_reg_number' => $this->doctor_reg_number,
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
