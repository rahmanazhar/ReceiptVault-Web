<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Models\Category;
use App\Domain\Services\CategoryService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\{
    StoreCategoryRequest,
    UpdateCategoryRequest,
    MergeCategoryRequest
};
use App\Http\Resources\{
    CategoryResource,
    CategoryCollection,
    TransactionCollection
};
use Illuminate\Http\{JsonResponse, Request, Response};

class CategoryController extends Controller
{
    protected CategoryService $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
        $this->authorizeResource(Category::class, 'category');
    }

    public function index(Request $request): JsonResponse
    {
        $categories = $this->categoryService->getUserCategories(auth()->id());

        return response()->json(new CategoryCollection($categories));
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->createCategory(
            auth()->id(),
            $request->validated()
        );

        return response()->json(
            new CategoryResource($category),
            Response::HTTP_CREATED
        );
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json(new CategoryResource(
            $category->loadCount('transactions')
        ));
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category = $this->categoryService->updateCategory(
            $category->id,
            $request->validated()
        );

        return response()->json(new CategoryResource($category));
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->categoryService->deleteCategory($category->id);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function transactions(Category $category): JsonResponse
    {
        $transactions = $category->transactions()
            ->with(['receipt'])
            ->orderBy('transaction_date', 'desc')
            ->paginate();

        return response()->json(new TransactionCollection($transactions));
    }

    public function stats(Category $category): JsonResponse
    {
        $stats = $this->categoryService->getCategoryAnalytics(
            auth()->id(),
            $category->id
        );

        return response()->json($stats);
    }

    public function merge(MergeCategoryRequest $request, Category $category): JsonResponse
    {
        $success = $this->categoryService->deleteCategory(
            $category->id,
            $request->input('target_category_id')
        );

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'Categories merged successfully'
                : 'Failed to merge categories'
        ]);
    }

    public function mostUsed(): JsonResponse
    {
        $categories = $this->categoryService->getMostUsedCategories(auth()->id());

        return response()->json(new CategoryCollection($categories));
    }

    public function monthlySpending(Category $category, Request $request): JsonResponse
    {
        $spending = $this->categoryService->getMonthlySpendingByCategory(
            auth()->id(),
            $category->id,
            $request->input('months', 12)
        );

        return response()->json($spending);
    }
}
