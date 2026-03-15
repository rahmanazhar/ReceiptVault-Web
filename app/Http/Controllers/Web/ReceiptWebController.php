<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Domain\Models\Receipt;
use App\Domain\Models\Category;
use App\Domain\Models\LhdnTaxRelief;
use App\Domain\Services\ReceiptService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReceiptWebController extends Controller
{
    public function __construct(
        private ReceiptService $receiptService,
    ) {}

    public function index(Request $request)
    {
        $query = Receipt::where('user_id', $request->user()->id);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('merchant_name', 'like', "%{$search}%")
                  ->orWhere('receipt_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('purchase_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('purchase_date', '<=', $dateTo);
        }

        $receipts = $query->latest()->paginate(20)->withQueryString();

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

    public function rotate(Request $request, Receipt $receipt)
    {
        if ($receipt->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'degrees' => ['required', 'integer', 'in:-90,90,180,270,-270'],
        ]);

        $degrees = (int) $request->degrees;
        $path = $receipt->image_path;

        if (!$path || !Storage::disk('public')->exists($path)) {
            return back()->with('error', 'Image not found.');
        }

        $fullPath = Storage::disk('public')->path($path);

        // Use GD to rotate
        $info = getimagesize($fullPath);
        if (!$info) {
            return back()->with('error', 'Invalid image.');
        }

        $mime = $info['mime'];
        $image = match ($mime) {
            'image/jpeg' => imagecreatefromjpeg($fullPath),
            'image/png' => imagecreatefrompng($fullPath),
            default => null,
        };

        if (!$image) {
            return back()->with('error', 'Unsupported image format for rotation.');
        }

        // For PNG, preserve transparency
        if ($mime === 'image/png') {
            imagealphablending($image, false);
            imagesavealpha($image, true);
            $bgColor = imagecolorallocatealpha($image, 255, 255, 255, 0);
        } else {
            $bgColor = imagecolorallocate($image, 255, 255, 255);
        }

        // GD rotates counter-clockwise, so negate for clockwise
        $rotated = imagerotate($image, -$degrees, $bgColor);
        imagedestroy($image);

        if (!$rotated) {
            return back()->with('error', 'Rotation failed.');
        }

        if ($mime === 'image/png') {
            imagealphablending($rotated, false);
            imagesavealpha($rotated, true);
        }

        match ($mime) {
            'image/jpeg' => imagejpeg($rotated, $fullPath, 92),
            'image/png' => imagepng($rotated, $fullPath),
            default => null,
        };
        imagedestroy($rotated);

        // Touch updated_at to bust browser cache
        $receipt->touch();

        return back()->with('success', 'Image rotated.');
    }

    public function download(Request $request, Receipt $receipt)
    {
        if ($receipt->user_id !== $request->user()->id) {
            abort(403);
        }

        $path = $receipt->image_path;

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, 'Image not found.');
        }

        $filename = $receipt->original_filename
            ?? ('receipt-' . $receipt->id . '.' . pathinfo($path, PATHINFO_EXTENSION));

        return Storage::disk('public')->download($path, $filename);
    }

    public function recrop(Request $request, Receipt $receipt)
    {
        if ($receipt->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'image' => ['required', 'file', 'mimes:jpeg,png,jpg', 'max:10240'],
        ]);

        $file = $request->file('image');
        $filename = \Illuminate\Support\Str::uuid() . '.' . $file->getClientOriginalExtension();
        $newPath = $file->storeAs('receipts', $filename, 'public');

        // Delete old image
        if ($receipt->image_path && Storage::disk('public')->exists($receipt->image_path)) {
            Storage::disk('public')->delete($receipt->image_path);
        }

        $receipt->update([
            'image_path' => $newPath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return back()->with('success', 'Receipt image updated.');
    }

    public function retryAi(Request $request, Receipt $receipt)
    {
        if ($receipt->user_id !== $request->user()->id) {
            abort(403);
        }

        // Run AI processing synchronously
        \App\Jobs\ProcessReceiptWithAi::dispatchSync($receipt->id);

        return back()->with('success', 'AI processing completed.');
    }
}
