<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Domain\Models\Document;
use App\Domain\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentWebController extends Controller
{
    public function __construct(
        private DocumentService $service,
    ) {}

    public function index(Request $request)
    {
        $query = Document::where('user_id', $request->user()->id);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('sender', 'like', "%{$search}%")
                  ->orWhere('recipient', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($documentType = $request->input('document_type')) {
            $query->where('document_type', $documentType);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('issue_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('issue_date', '<=', $dateTo);
        }

        // Sorting
        $sortable = ['title', 'document_type', 'sender', 'issue_date', 'status', 'ai_confidence_score', 'created_at'];
        $sortBy = in_array($request->input('sort_by'), $sortable) ? $request->input('sort_by') : 'created_at';
        $sortDir = $request->input('sort_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);
        if ($sortBy !== 'created_at') {
            $query->orderBy('created_at', 'desc');
        }

        $documents = $query->paginate(20)->withQueryString();

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'filters' => $request->only(['search', 'status', 'document_type', 'date_from', 'date_to']),
            'sorting' => ['sort_by' => $sortBy, 'sort_dir' => $sortDir],
        ]);
    }

    public function create()
    {
        return Inertia::render('Documents/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:10240'],
            'source' => ['nullable', 'in:upload,camera,scan'],
        ]);

        $document = $this->service->uploadDocument(
            $request->user()->id,
            $request->file('image'),
            $request->only(['source'])
        );

        return redirect("/documents/{$document->id}")
            ->with('success', 'Document uploaded successfully. AI is processing your document.');
    }

    public function show(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        return Inertia::render('Documents/Show', [
            'document' => $document,
        ]);
    }

    public function update(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'document_type' => ['nullable', 'string', 'in:summons,business_card,contract,letter,invoice,warranty,certificate,other'],
            'title' => ['nullable', 'string', 'max:255'],
            'sender' => ['nullable', 'string', 'max:255'],
            'recipient' => ['nullable', 'string', 'max:255'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'issue_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'additional_fields' => ['nullable', 'array'],
            'status' => ['nullable', 'in:pending,processing,review_needed,completed,failed'],
        ]);

        $document->update($validated);

        return redirect("/documents/{$document->id}")
            ->with('success', 'Document updated successfully.');
    }

    public function destroy(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        $document->delete();

        return redirect('/documents')
            ->with('success', 'Document deleted.');
    }

    public function rotate(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'degrees' => ['required', 'integer', 'in:-90,90,180,270,-270'],
        ]);

        $degrees = (int) $request->degrees;
        $path = $document->image_path;

        if (!$path || !Storage::disk('public')->exists($path)) {
            return back()->with('error', 'Image not found.');
        }

        $fullPath = Storage::disk('public')->path($path);

        if ($document->mime_type === 'application/pdf') {
            return back()->with('error', 'PDF files cannot be rotated.');
        }

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

        if ($mime === 'image/png') {
            imagealphablending($image, false);
            imagesavealpha($image, true);
            $bgColor = imagecolorallocatealpha($image, 255, 255, 255, 0);
        } else {
            $bgColor = imagecolorallocate($image, 255, 255, 255);
        }

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

        $document->touch();

        return back()->with('success', 'Image rotated.');
    }

    public function download(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        $path = $document->image_path;

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, 'Image not found.');
        }

        $filename = $document->original_filename
            ?? ('document-' . $document->id . '.' . pathinfo($path, PATHINFO_EXTENSION));

        return Storage::disk('public')->download($path, $filename);
    }

    public function recrop(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'image' => ['required', 'file', 'mimes:jpeg,png,jpg', 'max:10240'],
        ]);

        $file = $request->file('image');
        $filename = \Illuminate\Support\Str::uuid() . '.' . $file->getClientOriginalExtension();
        $newPath = $file->storeAs('documents', $filename, 'public');

        if ($document->image_path && Storage::disk('public')->exists($document->image_path)) {
            Storage::disk('public')->delete($document->image_path);
        }

        $document->update([
            'image_path' => $newPath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return back()->with('success', 'Document image updated.');
    }

    public function retryAi(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403);
        }

        \App\Jobs\ProcessDocumentWithAi::dispatchSync($document->id);

        return back()->with('success', 'AI processing completed.');
    }
}
