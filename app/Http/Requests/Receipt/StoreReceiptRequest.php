<?php

namespace App\Http\Requests\Receipt;

use Illuminate\Foundation\Http\FormRequest;

class StoreReceiptRequest extends FormRequest
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
                'image',
                'max:10240', // 10MB max
                'mimes:jpeg,png,jpg'
            ],
            'purchase_date' => [
                'nullable',
                'date',
                'before_or_equal:today'
            ],
            'merchant_name' => [
                'nullable',
                'string',
                'max:255'
            ],
            'total_amount' => [
                'nullable',
                'numeric',
                'min:0'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'Please upload a receipt image',
            'image.file' => 'The receipt must be a file',
            'image.image' => 'The file must be an image',
            'image.max' => 'The image size must not exceed 10MB',
            'image.mimes' => 'The image must be a JPEG, PNG, or JPG file',
            'purchase_date.date' => 'Please provide a valid date',
            'purchase_date.before_or_equal' => 'Purchase date cannot be in the future',
            'merchant_name.max' => 'Merchant name cannot exceed 255 characters',
            'total_amount.numeric' => 'Total amount must be a number',
            'total_amount.min' => 'Total amount cannot be negative',
        ];
    }
}
