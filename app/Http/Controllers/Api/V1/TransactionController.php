<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Models\Transaction;
use App\Domain\Services\TransactionService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\{
    StoreTransactionRequest,
    UpdateTransactionRequest,
    BulkCategorizeRequest
};
use App\Http\Resources\{
    TransactionResource,
    TransactionCollection
};
use Illuminate\Http\{JsonResponse, Request, Response};

class TransactionController extends Controller
{
    protected TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
        $this->authorizeResource(Transaction::class, 'transaction');
    }

    public function index(Request $request): JsonResponse
    {
        $transactions = $this->transactionService->getTransactionsPaginated(
            auth()->id(),
            $request->only([
                'start_date',
                'end_date',
                'category_id',
                'tax_deductible',
                'tax_category'
            ]),
            $request->input('per_page', 15)
        );

        return response()->json(new TransactionCollection($transactions));
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $transaction = $this->transactionService->createTransaction(
            auth()->id(),
            $request->validated()
        );

        return response()->json(
            new TransactionResource($transaction),
            Response::HTTP_CREATED
        );
    }

    public function show(Transaction $transaction): JsonResponse
    {
        return response()->json(new TransactionResource(
            $transaction->load(['category', 'receipt'])
        ));
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): JsonResponse
    {
        $transaction = $this->transactionService->updateTransaction(
            $transaction->id,
            $request->validated()
        );

        return response()->json(new TransactionResource($transaction));
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        $this->transactionService->deleteTransaction($transaction->id);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function bulkCategorize(BulkCategorizeRequest $request): JsonResponse
    {
        $success = $this->transactionService->bulkCategorizeTransactions(
            $request->input('transaction_ids'),
            $request->input('category_id')
        );

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'Transactions categorized successfully'
                : 'Some transactions could not be categorized'
        ]);
    }

    public function monthlyStats(Request $request): JsonResponse
    {
        $stats = $this->transactionService->getTransactionStats(auth()->id());

        return response()->json([
            'monthly_totals' => $stats['monthly_totals'],
            'category_distribution' => $stats['category_distribution'],
            'uncategorized_count' => $stats['uncategorized_count']
        ]);
    }

    public function categoryStats(Request $request): JsonResponse
    {
        $distribution = $this->transactionService->getCategoryDistribution(
            auth()->id(),
            $request->input('start_date'),
            $request->input('end_date')
        );

        return response()->json($distribution);
    }

    public function taxReport(string $year): JsonResponse
    {
        $report = $this->transactionService->getTaxReport(auth()->id(), $year);

        return response()->json([
            'total_deductible' => $report['total_deductible'],
            'categorized_deductions' => $report['categorized_deductions'],
            'transactions' => new TransactionCollection($report['transactions'])
        ]);
    }
}
