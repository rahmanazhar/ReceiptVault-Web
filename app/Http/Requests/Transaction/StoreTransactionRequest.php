<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receipt_id' => [
                'nullable',
                'exists:receipts,id'
            ],
            'category_id' => [
                'nullable',
                'exists:categories,id'
            ],
            'description' => [
                'required',
                'string',
                'max:255'
            ],
            'amount' => [
                'required',
                'numeric',
                'min:0'
            ],
            'transaction_date' => [
                'required',
                'date',
                'before_or_equal:today'
            ],
            'is_tax_deductible' => [
                'boolean'
            ],
            'tax_category' => [
                'nullable',
                'string',
                'max:50',
                'required_if:is_tax_deductible,true'
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'metadata' => [
                'nullable',
                'array'
            ],
            'category_name' => [
                'nullable',
                'string',
                'max:255',
                'required_without:category_id'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'description.required' => 'Description is required',
            'description.max' => 'Description cannot exceed 255 characters',
            'amount.required' => 'Amount is required',
            'amount.numeric' => 'Amount must be a number',
            'amount.min' => 'Amount cannot be negative',
            'transaction_date.required' => 'Transaction date is required',
            'transaction_date.date' => 'Please provide a valid date',
            'transaction_date.before_or_equal' => 'Transaction date cannot be in the future',
            'tax_category.required_if' => 'Tax category is required for tax-deductible transactions',
            'tax_category.max' => 'Tax category cannot exceed 50 characters',
            'notes.max' => 'Notes cannot exceed 1000 characters',
            'category_name.max' => 'Category name cannot exceed 255 characters',
            'category_name.required_without' => 'Either category ID or category name must be provided',
        ];
    }
}
