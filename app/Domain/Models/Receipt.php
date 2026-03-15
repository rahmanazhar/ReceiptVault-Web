<?php

namespace App\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Receipt extends Model
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
        'merchant_name',
        'total_amount',
        'currency',
        'tax_amount',
        'subtotal_amount',
        'payment_method',
        'receipt_number',
        'purchase_date',
        'ocr_data',
        'ai_confidence_score',
        'ai_raw_response',
        'additional_fields',
        'notes',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'subtotal_amount' => 'decimal:2',
        'ai_confidence_score' => 'decimal:2',
        'file_size' => 'integer',
        'purchase_date' => 'date',
        'ocr_data' => 'array',
        'ai_raw_response' => 'array',
        'additional_fields' => 'array',
    ];

    protected $appends = ['image_url', 'thumbnail_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? asset('storage/' . $this->image_path) : null;
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

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
