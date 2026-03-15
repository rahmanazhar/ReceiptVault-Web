<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_type' => ['sometimes', 'string', 'in:summons,business_card,contract,letter,invoice,warranty,certificate,other'],
            'title' => ['sometimes', 'string', 'max:255'],
            'sender' => ['sometimes', 'string', 'max:255'],
            'recipient' => ['sometimes', 'string', 'max:255'],
            'reference_number' => ['sometimes', 'string', 'max:255'],
            'issue_date' => ['sometimes', 'nullable', 'date'],
            'expiry_date' => ['sometimes', 'nullable', 'date'],
            'description' => ['sometimes', 'nullable', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'in:pending,processing,review_needed,completed,failed'],
            'image' => ['sometimes', 'file', 'max:10240', 'mimes:jpeg,png,jpg,pdf'],
        ];
    }

    public function messages(): array
    {
        return [
            'document_type.in' => 'Invalid document type',
            'title.max' => 'Title cannot exceed 255 characters',
            'sender.max' => 'Sender cannot exceed 255 characters',
            'recipient.max' => 'Recipient cannot exceed 255 characters',
            'reference_number.max' => 'Reference number cannot exceed 255 characters',
            'status.in' => 'Invalid status value',
            'image.max' => 'The file size must not exceed 10MB',
            'image.mimes' => 'The file must be a JPEG, PNG, JPG, or PDF',
        ];
    }
}
