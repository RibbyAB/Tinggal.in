<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateComplaintStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:OPEN,IN_PROGRESS,RESOLVED,CLOSED'],
            'note' => ['nullable', 'string'],
        ];
    }
}
