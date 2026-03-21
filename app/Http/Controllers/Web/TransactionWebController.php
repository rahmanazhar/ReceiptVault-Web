<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Domain\Models\Transaction;
use App\Domain\Models\Category;
use App\Domain\Models\LhdnTaxRelief;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionWebController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::where('user_id', $request->user()->id)
            ->with(['category', 'receipt']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }

        if ($request->filled('tax_deductible')) {
            if ($request->tax_deductible === 'yes') {
                $query->where('is_tax_deductible', true);
            } elseif ($request->tax_deductible === 'no') {
                $query->where('is_tax_deductible', false);
            }
        }

        // Sorting
        $sortable = ['description', 'transaction_date', 'amount', 'is_tax_deductible', 'created_at'];
        $sortBy = in_array($request->input('sort_by'), $sortable) ? $request->input('sort_by') : 'transaction_date';
        $sortDir = $request->input('sort_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);
        if ($sortBy !== 'created_at') {
            $query->orderBy('created_at', 'desc');
        }

        $transactions = $query->paginate(30)->withQueryString();

        $categories = Category::where(function ($q) use ($request) {
            $q->where('user_id', $request->user()->id)
              ->orWhere('is_system', true);
        })->orderBy('name')->get();

        // LHDN category name lookup for displaying category names on transactions
        $lhdnCategories = LhdnTaxRelief::where('tax_year', date('Y'))
            ->where('is_active', true)
            ->pluck('name', 'code');

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'categories' => $categories,
            'lhdnCategories' => $lhdnCategories,
            'filters' => $request->only(['category_id', 'date_from', 'date_to', 'tax_deductible']),
            'sorting' => ['sort_by' => $sortBy, 'sort_dir' => $sortDir],
        ]);
    }
}
