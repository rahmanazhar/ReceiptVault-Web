<?php

namespace App\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'receipt_id',
        'category_id',
        'description',
        'amount',
        'currency',
        'transaction_date',
        'is_tax_deductible',
        'tax_category',
        'lhdn_category_code',
        'tax_relief_amount',
        'tax_year',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'tax_relief_amount' => 'decimal:2',
        'tax_year' => 'integer',
        'transaction_date' => 'date',
        'is_tax_deductible' => 'boolean',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(Receipt::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function lhdnTaxRelief(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(LhdnTaxRelief::class, 'code', 'lhdn_category_code')
            ->where('tax_year', $this->tax_year ?? date('Y'));
    }
}
