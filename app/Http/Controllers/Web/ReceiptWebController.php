<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Domain\Models\Receipt;
use App\Domain\Models\Category;
use App\Domain\Models\LhdnTaxRelief;
use App\Domain\Services\ReceiptService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReceiptWebController extends Controller
{
    public function __construct(
        private ReceiptService $receiptService,
    ) {}

    public function index(Request $request)
    {
        $receipts = Receipt::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return Inertia::render('Receipts/Index', [
            'receipts' => $receipts,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Receipts/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:10240'],
            'source' => ['nullable', 'in:upload,camera,scan'],
        ]);

        $receipt = $this->receiptService->uploadReceipt(
            $request->user()->id,
            $request->file('image'),
            $request->only(['source'])
        );

        return redirect("/receipts/{$receipt->id}")
            ->with('success', 'Receipt uploaded successfully. AI is processing your receipt.');
    }

    public function show(Request $request, Receipt $receipt)
    {
        if ($receipt->user_id !== $request->user()->id) {
            abort(403);
        }

        $receipt->load('transactions.category');

        $categories = Category::where(function ($q) use ($request) {
            $q->where('user_id', $request->user()->id)
              ->orWhere('is_system', true);
        })->orderBy('sort_order')->get();

        $lhdnCategories = LhdnTaxRelief::where('tax_year', date('Y'))
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Receipts/Show', [
            'receipt' => $receipt,
            'categories' => $categories,
            'lhdnCategories' => $lhdnCategories,
        ]);
    }

    public function update(Request $request, Receipt $receipt)
    {
        if ($receipt->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'merchant_name' => ['nullable', 'string', 'max:255'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'subtotal_amount' => ['nullable', 'numeric', 'min:0'],
            'purchase_date' => ['nullable', 'date'],
            'payment_method' => ['nullable', 'string'],
            'receipt_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'additional_fields' => ['nullable', 'array'],
            'status' => ['nullable', 'in:pending,processing,review_needed,completed,failed'],
        ]);

        $receipt->update($validated);

        return redirect("/receipts/{$receipt->id}")
            ->with('success', 'Receipt updated successfully.');
    }

    public function destroy(Request $request, Receipt $receipt)
    {
        if ($receipt->user_id !== $request->user()->id) {
            abort(403);
        }

        $receipt->delete();

        return redirect('/receipts')
            ->with('success', 'Receipt deleted.');
    }
}
