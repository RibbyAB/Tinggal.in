<?php

namespace App\Http\Requests;

use App\Models\Tenant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');
        $tenant = $this->targetTenant();

        $rules = [
            'name' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'email' => [
                $isUpdate ? 'sometimes' : 'required',
                'email',
                Rule::unique('users', 'email')->ignore($tenant?->user_id),
            ],
            'phone' => ['nullable', 'regex:/^[0-9+\-\s]{8,15}$/'],
            'ktp_number' => [
                'nullable',
                'string',
                Rule::unique('tenants', 'ktp_number')->ignore($tenant?->id),
            ],
            'emergency_contact' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
        ];

        if (! $isUpdate) {
            $rules['password'] = ['required', 'string', 'min:6'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Email ini sudah dipakai akun lain.',
            'ktp_number.unique' => 'Nomor KTP ini sudah terdaftar atas tenant lain.',
        ];
    }

    private function targetTenant(): ?Tenant
    {
        $tenant = $this->route('tenant');

        if ($tenant instanceof Tenant) {
            return $tenant;
        }

        $tenantId = $this->attributes->get('tenant_id');

        return $tenantId ? Tenant::find($tenantId) : null;
    }
}
