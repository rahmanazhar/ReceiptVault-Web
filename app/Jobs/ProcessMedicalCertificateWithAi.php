<?php

namespace App\Jobs;

use App\Domain\Models\MedicalCertificate;
use App\Domain\Services\AbacusAiService;
use App\Events\MedicalCertificateProcessed;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMedicalCertificateWithAi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        private int $medicalCertificateId,
    ) {}

    public function handle(AbacusAiService $aiService): void
    {
        $mc = MedicalCertificate::find($this->medicalCertificateId);
        if (!$mc) {
            return;
        }

        $mc->update(['status' => 'processing']);

        try {
            $result = $aiService->analyzeMedicalCertificate($mc->image_path);

            $mc->update([
                'patient_name' => $result->patientName ?? $mc->patient_name,
                'doctor_name' => $result->doctorName ?? $mc->doctor_name,
                'clinic_name' => $result->clinicName ?? $mc->clinic_name,
                'diagnosis' => $result->diagnosis ?? $mc->diagnosis,
                'mc_start_date' => $result->mcStartDate ?? $mc->mc_start_date,
                'mc_end_date' => $result->mcEndDate ?? $mc->mc_end_date,
                'mc_days' => $result->mcDays ?? $mc->mc_days,
                'mc_number' => $result->mcNumber ?? $mc->mc_number,
                'issue_date' => $result->issueDate ?? $mc->issue_date,
                'doctor_reg_number' => $result->doctorRegNumber ?? $mc->doctor_reg_number,
                'ocr_data' => $result->toArray(),
                'ai_confidence_score' => $result->confidenceScore,
                'ai_raw_response' => $result->rawResponse,
                'additional_fields' => !empty($result->additionalFields) ? $result->additionalFields : null,
                'status' => 'review_needed',
            ]);

            event(new MedicalCertificateProcessed($mc));

            Log::info("Medical certificate {$this->medicalCertificateId} processed successfully", [
                'confidence' => $result->confidenceScore,
                'clinic' => $result->clinicName,
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to process medical certificate {$this->medicalCertificateId}: {$e->getMessage()}");

            $mc->update([
                'status' => 'failed',
                'ai_raw_response' => ['error' => $e->getMessage()],
            ]);

            if ($this->attempts() >= $this->tries) {
                return;
            }

            throw $e;
        }
    }
}
