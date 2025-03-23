<?php

namespace App\Http\Requests\Transaction;

use App\Domain\Models\Transaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class BulkCategorizeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_ids' => [
                'required',
                'array',
                'min:1'
            ],
            'transaction_ids.*' => [
                'required',
                'integer',
                'exists:transactions,id'
            ],
            'category_id' => [
                'required',
                'integer',
                'exists:categories,id'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_ids.required' => 'Please select at least one transaction',
            'transaction_ids.array' => 'Invalid transaction selection format',
            'transaction_ids.min' => 'Please select at least one transaction',
            'transaction_ids.*.exists' => 'One or more selected transactions do not exist',
            'category_id.required' => 'Please select a category',
            'category_id.exists' => 'Selected category does not exist'
        ];
    }

    protected function prepareForValidation(): void
    {
        // Ensure all user's transactions belong to them
        $this->merge([
            'transaction_ids' => array_filter(
                (array) $this->transaction_ids,
                fn($id) => Transaction::where('id', $id)
                    ->where('user_id', Auth::id())
                    ->exists()
            )
        ]);
    }
}
