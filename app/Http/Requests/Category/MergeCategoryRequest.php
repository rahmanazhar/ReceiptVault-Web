<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class MergeCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $sourceCategory = $this->route('category');
        $targetCategory = $this->input('target_category_id');

        // Check if both categories exist and belong to the user
        return !$sourceCategory->is_system 
            && $sourceCategory->user_id === Auth::id()
            && $targetCategory
            && $targetCategory !== $sourceCategory->id;
    }

    public function rules(): array
    {
        return [
            'target_category_id' => [
                'required',
                'integer',
                'exists:categories,id',
                'different:category',
                function ($attribute, $value, $fail) {
                    $category = $this->route('category');
                    if ($category && $value === $category->id) {
                        $fail('Cannot merge a category with itself.');
                    }
                }
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'target_category_id.required' => 'Please select a target category',
            'target_category_id.exists' => 'Selected target category does not exist',
            'target_category_id.different' => 'Cannot merge a category with itself'
        ];
    }

    protected function prepareForValidation(): void
    {
        // Ensure target category belongs to the user and is not a system category
        if ($targetId = $this->input('target_category_id')) {
            $targetCategory = \App\Domain\Models\Category::find($targetId);
            if (!$targetCategory 
                || $targetCategory->user_id !== Auth::id() 
                || $targetCategory->is_system
            ) {
                $this->merge(['target_category_id' => null]);
            }
        }
    }
}
