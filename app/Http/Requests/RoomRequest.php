<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');
        $sometimes = $isUpdate ? 'sometimes' : 'required';

        return [
            'room_number' => [
                $sometimes,
                'string',
                'max:50',
                Rule::unique('rooms', 'room_number')->ignore($this->route('room')),
            ],
            'floor' => [$sometimes, 'integer'],
            'type' => ['nullable', 'in:STANDARD,DELUXE,VIP'],
            'price' => [$sometimes, 'numeric', 'gt:0'],
            'capacity' => ['nullable', 'integer', 'gt:0'],
            'facilities' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'room_number.unique' => 'Nomor kamar ini sudah dipakai.',
        ];
    }
}
