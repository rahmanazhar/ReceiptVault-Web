<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Models\Document;
use App\Domain\Services\DocumentService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Document\{
    StoreDocumentRequest,
    UpdateDocumentRequest
};
use App\Http\Resources\{
    DocumentResource,
    DocumentCollection
};
use Illuminate\Http\{JsonResponse, Request, Response};

class DocumentController extends Controller
{
    protected DocumentService $service;

    public function __construct(DocumentService $service)
    {
        $this->service = $service;
        $this->authorizeResource(Document::class, 'document');
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $documents = Document::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json(new DocumentCollection($documents));
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $document = $this->service->uploadDocument(
            auth()->id(),
            $request->file('image')
        );

        return response()->json(
            new DocumentResource($document),
            Response::HTTP_CREATED
        );
    }

    public function show(Document $document): JsonResponse
    {
        $details = $this->service->getDocumentDetails($document->id);

        return response()->json([
            'document' => new DocumentResource($details['document']),
            'image_url' => $details['image_url'],
        ]);
    }

    public function update(UpdateDocumentRequest $request, Document $document): JsonResponse
    {
        $doc = $this->service->updateDocument(
            $document->id,
            $request->validated()
        );

        return response()->json(new DocumentResource($doc));
    }

    public function destroy(Document $document): JsonResponse
    {
        $this->service->deleteDocument($document->id);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function processOcr(Document $document): JsonResponse
    {
        \App\Jobs\ProcessDocumentWithAi::dispatchSync($document->id);

        return response()->json(new DocumentResource($document->fresh()));
    }
}
