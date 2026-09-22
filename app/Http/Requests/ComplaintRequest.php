<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category' => ['nullable', 'in:ELECTRICITY,WATER,FACILITY,CLEANLINESS,SECURITY,OTHER'],
            'priority' => ['nullable', 'in:LOW,MEDIUM,HIGH'],

            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,jfif,png,webp,gif,bmp,heic,heif', 'max:5120'],
        ];
    }
}