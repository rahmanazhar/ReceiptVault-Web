<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Domain\Models\Transaction;
use App\Domain\Models\Category;
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
            $query->where('is_tax_deductible', true);
        }

        $transactions = $query->latest('transaction_date')->paginate(30);

        $categories = Category::where(function ($q) use ($request) {
            $q->where('user_id', $request->user()->id)
              ->orWhere('is_system', true);
        })->orderBy('name')->get();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'date_from', 'date_to', 'tax_deductible']),
        ]);
    }
}
