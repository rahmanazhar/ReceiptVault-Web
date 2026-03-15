<?php

namespace App\Http\Requests\MedicalCertificate;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicalCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_name' => ['sometimes', 'string', 'max:255'],
            'doctor_name' => ['sometimes', 'string', 'max:255'],
            'clinic_name' => ['sometimes', 'string', 'max:255'],
            'diagnosis' => ['sometimes', 'string'],
            'mc_start_date' => ['sometimes', 'date'],
            'mc_end_date' => ['sometimes', 'date', 'after_or_equal:mc_start_date'],
            'mc_days' => ['sometimes', 'integer', 'min:0'],
            'mc_number' => ['sometimes', 'string', 'max:255'],
            'issue_date' => ['sometimes', 'date'],
            'doctor_reg_number' => ['sometimes', 'string', 'max:255'],
            'notes' => ['sometimes', 'string'],
            'status' => ['sometimes', 'in:pending,processing,review_needed,completed,failed'],
            'image' => ['sometimes', 'file', 'max:10240', 'mimes:jpeg,png,jpg,pdf'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_name.max' => 'Patient name cannot exceed 255 characters',
            'doctor_name.max' => 'Doctor name cannot exceed 255 characters',
            'clinic_name.max' => 'Clinic name cannot exceed 255 characters',
            'mc_end_date.after_or_equal' => 'End date must be on or after start date',
            'mc_days.integer' => 'MC days must be a whole number',
            'mc_days.min' => 'MC days cannot be negative',
            'mc_number.max' => 'MC number cannot exceed 255 characters',
            'doctor_reg_number.max' => 'Doctor registration number cannot exceed 255 characters',
            'status.in' => 'Invalid status value',
            'image.max' => 'The file size must not exceed 10MB',
            'image.mimes' => 'The file must be a JPEG, PNG, JPG, or PDF',
        ];
    }
}
