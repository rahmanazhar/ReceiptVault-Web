<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Models\Receipt;
use App\Domain\Services\ReceiptService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Receipt\{
    StoreReceiptRequest,
    UpdateReceiptRequest
};
use App\Http\Resources\{
    ReceiptResource,
    ReceiptCollection,
    TransactionCollection
};
use Illuminate\Http\{JsonResponse, Request, Response};

class ReceiptController extends Controller
{
    protected ReceiptService $receiptService;

    public function __construct(ReceiptService $receiptService)
    {
        $this->receiptService = $receiptService;
        $this->authorizeResource(Receipt::class, 'receipt');
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $receipts = Receipt::where('user_id', auth()->id())
            ->with(['transactions'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json(new ReceiptCollection($receipts));
    }

    public function store(StoreReceiptRequest $request): JsonResponse
    {
        $receipt = $this->receiptService->uploadReceipt(
            auth()->id(),
            $request->file('image')
        );

        return response()->json(
            new ReceiptResource($receipt),
            Response::HTTP_CREATED
        );
    }

    public function show(Receipt $receipt): JsonResponse
    {
        $details = $this->receiptService->getReceiptDetails($receipt->id);

        return response()->json([
            'receipt' => new ReceiptResource($details['receipt']),
            'transactions' => new TransactionCollection($details['transactions']),
            'image_url' => $details['image_url'],
        ]);
    }

    public function update(UpdateReceiptRequest $request, Receipt $receipt): JsonResponse
    {
        $receipt = $this->receiptService->updateReceipt(
            $receipt->id,
            $request->validated()
        );

        return response()->json(new ReceiptResource($receipt));
    }

    public function destroy(Receipt $receipt): JsonResponse
    {
        $this->receiptService->deleteReceipt($receipt->id);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function transactions(Receipt $receipt): JsonResponse
    {
        $transactions = $receipt->transactions()
            ->with(['category'])
            ->orderBy('transaction_date', 'desc')
            ->get();

        return response()->json(new TransactionCollection($transactions));
    }

    public function processOcr(Receipt $receipt): JsonResponse
    {
        // This would typically be handled by a job, but for now we'll process it directly
        $receipt = $this->receiptService->processOcrResult($receipt, [
            'merchant_name' => 'Sample Merchant', // This would come from actual OCR
            'total_amount' => 100.00,
            'purchase_date' => now(),
        ]);

        return response()->json(new ReceiptResource($receipt));
    }
}
