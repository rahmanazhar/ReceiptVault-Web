<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Domain\Models\MedicalCertificate;
use App\Domain\Services\MedicalCertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MedicalCertificateWebController extends Controller
{
    public function __construct(
        private MedicalCertificateService $service,
    ) {}

    public function index(Request $request)
    {
        $query = MedicalCertificate::where('user_id', $request->user()->id);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('clinic_name', 'like', "%{$search}%")
                  ->orWhere('mc_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('mc_start_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('mc_start_date', '<=', $dateTo);
        }

        $medicalCertificates = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('MedicalCertificates/Index', [
            'medicalCertificates' => $medicalCertificates,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function summary(Request $request)
    {
        $userId = $request->user()->id;

        // Yearly aggregation
        $yearly = MedicalCertificate::where('user_id', $userId)
            ->whereNotNull('mc_start_date')
            ->select(
                DB::raw('YEAR(mc_start_date) as year'),
                DB::raw('COUNT(*) as total_mcs'),
                DB::raw('COALESCE(SUM(mc_days), 0) as total_days'),
            )
            ->groupBy(DB::raw('YEAR(mc_start_date)'))
            ->orderByDesc('year')
            ->get();

        // Monthly breakdown per year
        $monthly = MedicalCertificate::where('user_id', $userId)
            ->whereNotNull('mc_start_date')
            ->select(
                DB::raw('YEAR(mc_start_date) as year'),
                DB::raw('MONTH(mc_start_date) as month'),
                DB::raw('COUNT(*) as total_mcs'),
                DB::raw('COALESCE(SUM(mc_days), 0) as total_days'),
            )
            ->groupBy(DB::raw('YEAR(mc_start_date)'), DB::raw('MONTH(mc_start_date)'))
            ->orderByDesc('year')
            ->orderBy('month')
            ->get()
            ->groupBy('year');

        // Recent MCs for context
        $recentMcs = MedicalCertificate::where('user_id', $userId)
            ->whereNotNull('mc_start_date')
            ->orderByDesc('mc_start_date')
            ->limit(10)
            ->get();

        return Inertia::render('MedicalCertificates/Summary', [
            'yearly' => $yearly,
            'monthly' => $monthly,
            'recentMcs' => $recentMcs,
        ]);
    }

    public function create()
    {
        return Inertia::render('MedicalCertificates/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:10240'],
            'source' => ['nullable', 'in:upload,camera,scan'],
        ]);

        $mc = $this->service->uploadMedicalCertificate(
            $request->user()->id,
            $request->file('image'),
            $request->only(['source'])
        );

        return redirect("/medical-certificates/{$mc->id}")
            ->with('success', 'Medical certificate uploaded successfully. AI is processing your document.');
    }

    public function show(Request $request, MedicalCertificate $medicalCertificate)
    {
        if ($medicalCertificate->user_id !== $request->user()->id) {
            abort(403);
        }

        return Inertia::render('MedicalCertificates/Show', [
            'medicalCertificate' => $medicalCertificate,
        ]);
    }

    public function update(Request $request, MedicalCertificate $medicalCertificate)
    {
        if ($medicalCertificate->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_name' => ['nullable', 'string', 'max:255'],
            'doctor_name' => ['nullable', 'string', 'max:255'],
            'clinic_name' => ['nullable', 'string', 'max:255'],
            'diagnosis' => ['nullable', 'string'],
            'mc_start_date' => ['nullable', 'date'],
            'mc_end_date' => ['nullable', 'date'],
            'mc_days' => ['nullable', 'integer', 'min:0'],
            'mc_number' => ['nullable', 'string', 'max:255'],
            'issue_date' => ['nullable', 'date'],
            'doctor_reg_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'additional_fields' => ['nullable', 'array'],
            'status' => ['nullable', 'in:pending,processing,review_needed,completed,failed'],
        ]);

        $medicalCertificate->update($validated);

        return redirect("/medical-certificates/{$medicalCertificate->id}")
            ->with('success', 'Medical certificate updated successfully.');
    }

    public function destroy(Request $request, MedicalCertificate $medicalCertificate)
    {
        if ($medicalCertificate->user_id !== $request->user()->id) {
            abort(403);
        }

        $medicalCertificate->delete();

        return redirect('/medical-certificates')
            ->with('success', 'Medical certificate deleted.');
    }

    public function rotate(Request $request, MedicalCertificate $medicalCertificate)
    {
        if ($medicalCertificate->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'degrees' => ['required', 'integer', 'in:-90,90,180,270,-270'],
        ]);

        $degrees = (int) $request->degrees;
        $path = $medicalCertificate->image_path;

        if (!$path || !Storage::disk('public')->exists($path)) {
            return back()->with('error', 'Image not found.');
        }

        $fullPath = Storage::disk('public')->path($path);

        if ($medicalCertificate->mime_type === 'application/pdf') {
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

        $medicalCertificate->touch();

        return back()->with('success', 'Image rotated.');
    }

    public function download(Request $request, MedicalCertificate $medicalCertificate)
    {
        if ($medicalCertificate->user_id !== $request->user()->id) {
            abort(403);
        }

        $path = $medicalCertificate->image_path;

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, 'Image not found.');
        }

        $filename = $medicalCertificate->original_filename
            ?? ('medical-certificate-' . $medicalCertificate->id . '.' . pathinfo($path, PATHINFO_EXTENSION));

        return Storage::disk('public')->download($path, $filename);
    }

    public function recrop(Request $request, MedicalCertificate $medicalCertificate)
    {
        if ($medicalCertificate->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'image' => ['required', 'file', 'mimes:jpeg,png,jpg', 'max:10240'],
        ]);

        $file = $request->file('image');
        $filename = \Illuminate\Support\Str::uuid() . '.' . $file->getClientOriginalExtension();
        $newPath = $file->storeAs('medical-certificates', $filename, 'public');

        if ($medicalCertificate->image_path && Storage::disk('public')->exists($medicalCertificate->image_path)) {
            Storage::disk('public')->delete($medicalCertificate->image_path);
        }

        $medicalCertificate->update([
            'image_path' => $newPath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return back()->with('success', 'Medical certificate image updated.');
    }

    public function retryAi(Request $request, MedicalCertificate $medicalCertificate)
    {
        if ($medicalCertificate->user_id !== $request->user()->id) {
            abort(403);
        }

        \App\Jobs\ProcessMedicalCertificateWithAi::dispatchSync($medicalCertificate->id);

        return back()->with('success', 'AI processing completed.');
    }
}
