<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Domain\Models\Receipt;
use App\Domain\Models\Transaction;
use App\Domain\Models\LhdnTaxRelief;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $currentYear = date('Y');
        $currentMonth = date('Y-m');

        $totalReceipts = Receipt::where('user_id', $userId)->count();
        $receiptsThisMonth = Receipt::where('user_id', $userId)
            ->whereYear('created_at', date('Y'))
            ->whereMonth('created_at', date('m'))
            ->count();

        $spendingThisMonth = Transaction::where('user_id', $userId)
            ->whereYear('transaction_date', date('Y'))
            ->whereMonth('transaction_date', date('m'))
            ->sum('amount');

        $taxDeductibleYtd = Transaction::where('user_id', $userId)
            ->where('is_tax_deductible', true)
            ->whereYear('transaction_date', $currentYear)
            ->sum('amount');

        $pendingReviews = Receipt::where('user_id', $userId)
            ->whereIn('status', ['pending', 'processing', 'review_needed'])
            ->count();

        // Monthly spending for chart (last 12 months)
        $monthlySpending = Transaction::where('user_id', $userId)
            ->where('transaction_date', '>=', now()->subMonths(12)->startOfMonth())
            ->selectRaw("DATE_FORMAT(transaction_date, '%Y-%m') as month")
            ->selectRaw('SUM(amount) as total')
            ->selectRaw('SUM(CASE WHEN is_tax_deductible = 1 THEN amount ELSE 0 END) as tax_deductible')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Category distribution
        $categoryDistribution = Transaction::where('transactions.user_id', $userId)
            ->whereYear('transaction_date', $currentYear)
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name', 'categories.color')
            ->selectRaw('SUM(transactions.amount) as total')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        // LHDN tax relief progress - show all top-level categories
        $lhdnCategories = LhdnTaxRelief::where('tax_year', $currentYear)
            ->where('is_active', true)
            ->whereNull('parent_code')
            ->get();

        $taxReliefProgress = $lhdnCategories->map(function ($category) use ($userId, $currentYear) {
            // Include sub-category claims in parent total
            $childCodes = LhdnTaxRelief::where('parent_code', $category->code)
                ->where('tax_year', $currentYear)
                ->pluck('code');

            $allCodes = $childCodes->push($category->code);

            $claimed = Transaction::where('user_id', $userId)
                ->whereIn('lhdn_category_code', $allCodes)
                ->where('tax_year', $currentYear)
                ->sum('tax_relief_amount');

            $receiptCount = Transaction::where('user_id', $userId)
                ->whereIn('lhdn_category_code', $allCodes)
                ->where('tax_year', $currentYear)
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
                'metadata' => $category->metadata,
            ];
        })
        // Sort: claimed categories first (by percentage desc), then unclaimed alphabetically
        ->sortBy(function ($item) {
            return $item['claimed_amount'] > 0 ? -$item['percentage'] : 1000 + ord($item['name'][0]);
        })
        ->values();

        $recentReceipts = Receipt::where('user_id', $userId)
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'total_receipts' => $totalReceipts,
                'receipts_this_month' => $receiptsThisMonth,
                'spending_this_month' => (float) $spendingThisMonth,
                'tax_deductible_ytd' => (float) $taxDeductibleYtd,
                'pending_reviews' => $pendingReviews,
            ],
            'monthlySpending' => $monthlySpending,
            'categoryDistribution' => $categoryDistribution,
            'taxReliefProgress' => $taxReliefProgress,
            'recentReceipts' => $recentReceipts,
        ]);
    }
}
