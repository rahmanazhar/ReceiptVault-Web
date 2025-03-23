<?php

namespace App\Http\Requests\Receipt;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'merchant_name' => [
                'sometimes',
                'string',
                'max:255'
            ],
            'purchase_date' => [
                'sometimes',
                'date',
                'before_or_equal:today'
            ],
            'total_amount' => [
                'sometimes',
                'numeric',
                'min:0'
            ],
            'image' => [
                'sometimes',
                'file',
                'image',
                'max:10240', // 10MB max
                'mimes:jpeg,png,jpg'
            ],
            'status' => [
                'sometimes',
                'string',
                'in:pending,processing,completed,failed'
            ],
            'ocr_data' => [
                'sometimes',
                'array'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'merchant_name.max' => 'Merchant name cannot exceed 255 characters',
            'purchase_date.date' => 'Please provide a valid date',
            'purchase_date.before_or_equal' => 'Purchase date cannot be in the future',
            'total_amount.numeric' => 'Total amount must be a number',
            'total_amount.min' => 'Total amount cannot be negative',
            'image.file' => 'The receipt must be a file',
            'image.image' => 'The file must be an image',
            'image.max' => 'The image size must not exceed 10MB',
            'image.mimes' => 'The image must be a JPEG, PNG, or JPG file',
            'status.in' => 'Invalid status value',
            'ocr_data.array' => 'OCR data must be an array'
        ];
    }
}
