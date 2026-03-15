<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
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
            'image.required' => 'Please upload a document image',
            'image.file' => 'The document must be a file',
            'image.max' => 'The file size must not exceed 10MB',
            'image.mimes' => 'The file must be a JPEG, PNG, JPG, or PDF',
        ];
    }
}
