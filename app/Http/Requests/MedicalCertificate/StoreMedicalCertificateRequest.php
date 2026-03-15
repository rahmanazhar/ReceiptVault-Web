<?php

namespace App\Http\Requests\MedicalCertificate;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicalCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => [
                'required',
                'file',
                'max:10240',
                'mimes:jpeg,png,jpg,pdf'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'Please upload a medical certificate image',
            'image.file' => 'The medical certificate must be a file',
            'image.max' => 'The file size must not exceed 10MB',
            'image.mimes' => 'The file must be a JPEG, PNG, JPG, or PDF',
        ];
    }
}
