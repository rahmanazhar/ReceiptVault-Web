<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Models\MedicalCertificate;
use App\Domain\Services\MedicalCertificateService;
use App\Http\Controllers\Controller;
use App\Http\Requests\MedicalCertificate\{
    StoreMedicalCertificateRequest,
    UpdateMedicalCertificateRequest
};
use App\Http\Resources\{
    MedicalCertificateResource,
    MedicalCertificateCollection
};
use Illuminate\Http\{JsonResponse, Request, Response};

class MedicalCertificateController extends Controller
{
    protected MedicalCertificateService $service;

    public function __construct(MedicalCertificateService $service)
    {
        $this->service = $service;
        $this->authorizeResource(MedicalCertificate::class, 'medical_certificate');
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $mcs = MedicalCertificate::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json(new MedicalCertificateCollection($mcs));
    }

    public function store(StoreMedicalCertificateRequest $request): JsonResponse
    {
        $mc = $this->service->uploadMedicalCertificate(
            auth()->id(),
            $request->file('image')
        );

        return response()->json(
            new MedicalCertificateResource($mc),
            Response::HTTP_CREATED
        );
    }

    public function show(MedicalCertificate $medicalCertificate): JsonResponse
    {
        $details = $this->service->getMedicalCertificateDetails($medicalCertificate->id);

        return response()->json([
            'medical_certificate' => new MedicalCertificateResource($details['medical_certificate']),
            'image_url' => $details['image_url'],
        ]);
    }

    public function update(UpdateMedicalCertificateRequest $request, MedicalCertificate $medicalCertificate): JsonResponse
    {
        $mc = $this->service->updateMedicalCertificate(
            $medicalCertificate->id,
            $request->validated()
        );

        return response()->json(new MedicalCertificateResource($mc));
    }

    public function destroy(MedicalCertificate $medicalCertificate): JsonResponse
    {
        $this->service->deleteMedicalCertificate($medicalCertificate->id);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function processOcr(MedicalCertificate $medicalCertificate): JsonResponse
    {
        \App\Jobs\ProcessMedicalCertificateWithAi::dispatchSync($medicalCertificate->id);

        return response()->json(new MedicalCertificateResource($medicalCertificate->fresh()));
    }
}
