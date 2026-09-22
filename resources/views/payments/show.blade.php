@extends('layouts.app')

@php
    $role = auth()->user()->role;
    $prefix = strtolower($role);
    $isTenant = $role === 'TENANT';
    $canVerify = $role === 'OWNER';
@endphp

@section('content')
<div class="space-y-4" x-data="{ rejectOpen: false }">
    <div>
        <h1 class="text-xl font-semibold text-gray-900">Payment #{{ $payment->id }}</h1>
        <p class="text-sm text-gray-500">Submitted payment proof and verification status.</p>
    </div>

    <x-panel title="Payment Details">
        <dl class="grid grid-cols-2 gap-4 text-sm">
            @unless ($isTenant)
                <div>
                    <dt class="text-gray-500">Tenant</dt>
                    <dd class="font-medium text-gray-900">{{ $payment->bill->rental->tenant->user->name ?? '-' }}</dd>
                </div>
            @endunless
            <div>
                <dt class="text-gray-500">Room</dt>
                <dd class="font-medium text-gray-900">{{ $payment->bill->rental->room->room_number ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-gray-500">Amount</dt>
                <dd class="font-medium text-gray-900">Rp {{ number_format($payment->amount, 0, ',', '.') }}</dd>
            </div>
            <div>
                <dt class="text-gray-500">Method</dt>
                <dd class="font-medium text-gray-900">{{ $payment->method ? ucfirst(strtolower(str_replace('_', ' ', $payment->method))) : '-' }}</dd>
            </div>
            <div>
                <dt class="text-gray-500">Status</dt>
                <dd><x-status-badge :status="$payment->status" /></dd>
            </div>
            <div>
                <dt class="text-gray-500">Proof</dt>
                <dd>
                    @if ($payment->proof_file_path)
                        <a href="{{ $payment->proof_file_path }}" target="_blank" class="text-primary-600 hover:underline">View Proof</a>
                    @else
                        -
                    @endif
                </dd>
            </div>
            @if ($payment->verifiedBy)
                <div>
                    <dt class="text-gray-500">Verified By</dt>
                    <dd class="font-medium text-gray-900">{{ $payment->verifiedBy->name }}</dd>
                </div>
            @endif
            @if ($payment->rejection_note)
                <div class="col-span-2">
                    <dt class="text-gray-500">Rejection Note</dt>
                    <dd class="font-medium text-gray-900">{{ $payment->rejection_note }}</dd>
                </div>
            @endif
        </dl>

        @if ($canVerify && $payment->status === 'PENDING')
            <div class="mt-4 flex gap-2">
                <form method="POST" action="{{ route('owner.payments.approve', $payment) }}" onsubmit="return confirm('Approve this payment?');">
                    @csrf
                    @method('PATCH')
                    <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Approve</button>
                </form>
                <button type="button" @click="rejectOpen = true" class="rounded-lg bg-clay-500 px-4 py-2 text-sm font-medium text-white hover:bg-clay-700">Reject</button>
            </div>
        @elseif (! $isTenant && ! $canVerify && $payment->status === 'PENDING')
            <p class="mt-4 text-sm text-gray-400">Menunggu Owner</p>
        @endif
    </x-panel>

    @if ($canVerify)
        <div x-show="rejectOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" style="display:none">
            <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg" @click.outside="rejectOpen = false">
                <h3 class="mb-3 text-lg font-semibold text-gray-900">Reject Payment</h3>
                <form method="POST" action="{{ route('owner.payments.reject', $payment) }}">
                    @csrf
                    @method('PATCH')
                    <label class="mb-1 block text-sm font-medium text-gray-700">Rejection note</label>
                    <textarea name="note" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required></textarea>
                    <div class="mt-4 flex justify-end gap-2">
                        <button type="button" @click="rejectOpen = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" class="rounded-lg bg-clay-500 px-4 py-2 text-sm font-medium text-white hover:bg-clay-700">Reject</button>
                    </div>
                </form>
            </div>
        </div>
    @endif

    <a href="{{ route($prefix . '.payments.index') }}" class="text-sm text-primary-600 hover:underline">&larr; Back to Payments</a>
</div>

@endsection
