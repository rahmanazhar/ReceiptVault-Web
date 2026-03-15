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
            $claimed = Transaction::where('user_id', $userId)
                ->where('lhdn_category_code', $category->code)
                ->where('tax_year', $year)
                ->sum('tax_relief_amount');

            $receiptCount = Transaction::where('user_id', $userId)
                ->where('lhdn_category_code', $category->code)
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
            ];
        });

        $totalClaimed = $reliefProgress->sum('claimed_amount');
        $totalLimit = $reliefProgress->whereNull('parent_code')->sum('annual_limit');

        return Inertia::render('Tax/Index', [
            'year' => (int) $year,
            'reliefProgress' => $reliefProgress,
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
