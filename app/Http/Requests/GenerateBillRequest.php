<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateBillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rental_id' => ['required', 'integer', 'exists:rentals,id'],
            'bill_month' => ['required', 'integer', 'between:1,12'],
            'bill_year' => ['required', 'integer'],
            'due_date' => ['required', 'date'],
        ];
    }
}
