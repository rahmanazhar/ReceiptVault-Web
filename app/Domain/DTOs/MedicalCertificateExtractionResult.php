<?php

namespace App\Domain\DTOs;

class MedicalCertificateExtractionResult
{
    public function __construct(
        public ?string $patientName = null,
        public ?string $doctorName = null,
        public ?string $clinicName = null,
        public ?string $diagnosis = null,
        public ?string $mcStartDate = null,
        public ?string $mcEndDate = null,
        public ?int $mcDays = null,
        public ?string $mcNumber = null,
        public ?string $issueDate = null,
        public ?string $doctorRegNumber = null,
        public array $additionalFields = [],
        public float $confidenceScore = 0.0,
        public array $rawResponse = [],
    ) {}

    public static function fromAiResponse(array $parsed, array $rawResponse): self
    {
        $fieldsExtracted = 0;
        $totalFields = 7; // patient, doctor, clinic, mc_start, mc_end, mc_days, mc_number

        if (!empty($parsed['patient_name'])) $fieldsExtracted++;
        if (!empty($parsed['doctor_name'])) $fieldsExtracted++;
        if (!empty($parsed['clinic_name'])) $fieldsExtracted++;
        if (!empty($parsed['mc_start_date'])) $fieldsExtracted++;
        if (!empty($parsed['mc_end_date'])) $fieldsExtracted++;
        if (!empty($parsed['mc_days'])) $fieldsExtracted++;
        if (!empty($parsed['mc_number'])) $fieldsExtracted++;

        return new self(
            patientName: $parsed['patient_name'] ?? null,
            doctorName: $parsed['doctor_name'] ?? null,
            clinicName: $parsed['clinic_name'] ?? null,
            diagnosis: $parsed['diagnosis'] ?? null,
            mcStartDate: $parsed['mc_start_date'] ?? null,
            mcEndDate: $parsed['mc_end_date'] ?? null,
            mcDays: isset($parsed['mc_days']) ? (int) $parsed['mc_days'] : null,
            mcNumber: $parsed['mc_number'] ?? null,
            issueDate: $parsed['issue_date'] ?? null,
            doctorRegNumber: $parsed['doctor_reg_number'] ?? null,
            additionalFields: $parsed['additional_fields'] ?? [],
            confidenceScore: $fieldsExtracted / $totalFields,
            rawResponse: $rawResponse,
        );
    }

    public function toArray(): array
    {
        return [
            'patient_name' => $this->patientName,
            'doctor_name' => $this->doctorName,
            'clinic_name' => $this->clinicName,
            'diagnosis' => $this->diagnosis,
            'mc_start_date' => $this->mcStartDate,
            'mc_end_date' => $this->mcEndDate,
            'mc_days' => $this->mcDays,
            'mc_number' => $this->mcNumber,
            'issue_date' => $this->issueDate,
            'doctor_reg_number' => $this->doctorRegNumber,
            'additional_fields' => $this->additionalFields,
            'confidence_score' => $this->confidenceScore,
        ];
    }
}
