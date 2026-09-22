<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bill_id' => ['required', 'integer', 'exists:bills,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'method' => ['nullable', 'in:BANK_TRANSFER,CASH,E_WALLET'],

            'proof' => ['required', 'file', 'mimes:jpg,jpeg,jfif,png,webp,gif,bmp,heic,heif', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'proof.uploaded' => 'File gagal diunggah ke server. Biasanya karena ukurannya melebihi batas PHP (upload_max_filesize) atau folder temporary PHP tidak bisa ditulis. Coba file yang lebih kecil dulu.',
            'proof.required' => 'Bukti pembayaran wajib diunggah. Kalau file sudah dipilih tapi pesan ini tetap muncul, ukurannya melebihi batas server.',
            'proof.mimes' => 'Format file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau BMP.',
            'proof.max' => 'Ukuran file maksimal 5 MB.',
            'bill_id.required' => 'Pilih tagihan yang mau dibayar.',
            'amount.required' => 'Jumlah pembayaran wajib diisi.',
        ];
    }
}