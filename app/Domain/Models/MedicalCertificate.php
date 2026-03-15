<?php

namespace App\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalCertificate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'image_path',
        'thumbnail_path',
        'original_filename',
        'file_size',
        'mime_type',
        'source',
        'patient_name',
        'doctor_name',
        'clinic_name',
        'diagnosis',
        'mc_start_date',
        'mc_end_date',
        'mc_days',
        'mc_number',
        'issue_date',
        'doctor_reg_number',
        'notes',
        'ocr_data',
        'ai_confidence_score',
        'ai_raw_response',
        'additional_fields',
        'status',
    ];

    protected $casts = [
        'mc_start_date' => 'date',
        'mc_end_date' => 'date',
        'issue_date' => 'date',
        'mc_days' => 'integer',
        'file_size' => 'integer',
        'ai_confidence_score' => 'decimal:2',
        'ocr_data' => 'array',
        'ai_raw_response' => 'array',
        'additional_fields' => 'array',
    ];

    protected $appends = ['image_url', 'thumbnail_url'];

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) return null;
        return asset('storage/' . $this->image_path) . '?v=' . $this->updated_at?->timestamp;
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail_path
            ? asset('storage/' . $this->thumbnail_path)
            : $this->getImageUrlAttribute();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
