<?php

namespace App\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LhdnTaxRelief extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'annual_limit',
        'tax_year',
        'parent_code',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'annual_limit' => 'decimal:2',
        'tax_year' => 'integer',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function parent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_code', 'code')
            ->where('tax_year', $this->tax_year);
    }

    public function children(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(self::class, 'parent_code', 'code')
            ->where('tax_year', $this->tax_year);
    }

    public function scopeForYear($query, int $year)
    {
        return $query->where('tax_year', $year);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_code');
    }
}
