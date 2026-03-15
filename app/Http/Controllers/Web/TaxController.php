<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Domain\Models\LhdnTaxRelief;
use App\Domain\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->get('year', date('Y'));
        $userId = $request->user()->id;

        $lhdnCategories = LhdnTaxRelief::where('tax_year', $year)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $reliefProgress = $lhdnCategories->map(function ($category) use ($userId, $year) {
            // For parent categories, include sub-category claims in total
            $allCodes = collect([$category->code]);
            if (is_null($category->parent_code)) {
                $childCodes = LhdnTaxRelief::where('parent_code', $category->code)
                    ->where('tax_year', $year)
                    ->pluck('code');
                $allCodes = $allCodes->merge($childCodes);
            }

            $claimed = Transaction::where('user_id', $userId)
                ->whereIn('lhdn_category_code', $allCodes)
                ->where('tax_year', $year)
                ->sum('tax_relief_amount');

            $receiptCount = Transaction::where('user_id', $userId)
                ->whereIn('lhdn_category_code', $allCodes)
                ->where('tax_year', $year)
                ->count();

            return [
                'code' => $category->code,
                'name' => $category->name,
                'description' => $category->description,
                'annual_limit' => (float) $category->annual_limit,
                'claimed_amount' => (float) $claimed,
                'receipt_count' => $receiptCount,
                'percentage' => $category->annual_limit > 0
                    ? round(($claimed / $category->annual_limit) * 100, 1)
                    : 0,
                'parent_code' => $category->parent_code,
                'metadata' => $category->metadata,
            ];
        });

        // Nest sub-categories under their parents
        $parentItems = $reliefProgress->whereNull('parent_code')->values();
        $childItems = $reliefProgress->whereNotNull('parent_code');

        $nested = $parentItems->map(function ($parent) use ($childItems) {
            $parent['children'] = $childItems->where('parent_code', $parent['code'])->values()->toArray();
            return $parent;
        })->values();

        $totalClaimed = $reliefProgress->sum('claimed_amount');
        // Only sum parent limits (sub-limits are within parents, not additive)
        $totalLimit = $parentItems->sum('annual_limit');

        return Inertia::render('Tax/Index', [
            'year' => (int) $year,
            'reliefProgress' => $nested,
            'totalClaimed' => $totalClaimed,
            'totalLimit' => $totalLimit,
            'availableYears' => config('receipting.lhdn.supported_tax_years'),
        ]);
    }

    public function report(Request $request, int $year)
    {
        $userId = $request->user()->id;

        $transactions = Transaction::where('user_id', $userId)
            ->where('is_tax_deductible', true)
            ->where('tax_year', $year)
            ->with(['receipt', 'category'])
            ->orderBy('lhdn_category_code')
            ->orderBy('transaction_date')
            ->get()
            ->groupBy('lhdn_category_code');

        $lhdnCategories = LhdnTaxRelief::where('tax_year', $year)
            ->where('is_active', true)
            ->get()
            ->keyBy('code');

        return Inertia::render('Tax/Report', [
            'year' => $year,
            'groupedTransactions' => $transactions,
            'lhdnCategories' => $lhdnCategories,
        ]);
    }
}
