@extends('layouts.app')

@php
    $role = auth()->user()->role;
    $prefix = strtolower($role);
    $isTenant = $role === 'TENANT';
    $canVerify = $role === 'OWNER';
@endphp

@section('content')
<div class="space-y-4" x-data="{ uploadOpen: {{ $errors->any() ? 'true' : 'false' }}, rejectTarget: null }">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-xl font-semibold text-gray-900">{{ $isTenant ? 'My Payments' : 'Payments' }}</h1>
            <p class="text-sm text-gray-500">{{ $isTenant ? 'Upload and track your payment proofs.' : 'Verify tenant payment submissions.' }}</p>
        </div>
        @if ($isTenant)
            <button type="button" @click="uploadOpen = true" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                + Upload Payment
            </button>
        @endif
    </div>

    @unless ($isTenant)
        <x-panel title="Filters">
            <form method="GET" action="{{ route($prefix . '.payments.index') }}" class="flex flex-wrap items-end gap-3">
                <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="">All Status</option>
                        @foreach (['PENDING', 'APPROVED', 'REJECTED'] as $s)
                            <option value="{{ $s }}" @selected(request('status') === $s)>{{ ucfirst(strtolower($s)) }}</option>
                        @endforeach
                    </select>
                </div>
                <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Apply</button>
                <a href="{{ route($prefix . '.payments.index') }}" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Reset</a>
            </form>
        </x-panel>
    @endunless

    <x-panel title="Payment List">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-100 text-gray-500">
                        @unless ($isTenant)
                            <th class="py-2 pr-4">Tenant</th>
                        @endunless
                        <th class="py-2 pr-4">Amount</th>
                        <th class="py-2 pr-4">Method</th>
                        <th class="py-2 pr-4">Proof</th>
                        <th class="py-2 pr-4">Status</th>
                        <th class="py-2 pr-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($payments as $payment)
                        <tr class="border-b border-gray-50">
                            @unless ($isTenant)
                                <td class="py-2 pr-4 font-medium text-gray-900">{{ $payment->bill->rental->tenant->user->name ?? '-' }}</td>
                            @endunless
                            <td class="py-2 pr-4">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                            <td class="py-2 pr-4">{{ $payment->method ? ucfirst(strtolower(str_replace('_', ' ', $payment->method))) : '-' }}</td>
                            <td class="py-2 pr-4">
                                @if ($payment->proof_file_path)
                                    <a href="{{ $payment->proof_file_path }}" target="_blank" class="text-primary-600 hover:underline">View Proof</a>
                                @else
                                    -
                                @endif
                            </td>
                            <td class="py-2 pr-4"><x-status-badge :status="$payment->status" /></td>
                            <td class="py-2 pr-4">
                                <div class="flex items-center gap-2">
                                    <a href="{{ route($prefix . '.payments.show', $payment) }}" class="text-primary-600 hover:underline">View</a>
                                    @if (! $isTenant && $payment->status === 'PENDING')
                                        @if ($canVerify)
                                            <form method="POST" action="{{ route('owner.payments.approve', $payment) }}" class="inline" onsubmit="return confirm('Approve this payment?');">
                                                @csrf
                                                @method('PATCH')
                                                <button type="submit" class="text-primary-600 hover:underline">Approve</button>
                                            </form>
                                            <button type="button" class="text-clay-700 hover:underline" @click="rejectTarget = {{ $payment->id }}">Reject</button>
                                        @else
                                            <span class="text-gray-400">Menunggu Owner</span>
                                        @endif
                                    @endif
                                </div>

                                @if ($canVerify)
                                    <div x-show="rejectTarget === {{ $payment->id }}" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" style="display:none">
                                        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg" @click.outside="rejectTarget = null">
                                            <h3 class="mb-3 text-lg font-semibold text-gray-900">Reject Payment</h3>
                                            <form method="POST" action="{{ route('owner.payments.reject', $payment) }}">
                                                @csrf
                                                @method('PATCH')
                                                <label class="mb-1 block text-sm font-medium text-gray-700">Rejection note</label>
                                                <textarea name="note" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required></textarea>
                                                <div class="mt-4 flex justify-end gap-2">
                                                    <button type="button" @click="rejectTarget = null" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                                    <button type="submit" class="rounded-lg bg-clay-500 px-4 py-2 text-sm font-medium text-white hover:bg-clay-700">Reject</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="{{ $isTenant ? 5 : 6 }}" class="py-6 text-center text-gray-400">No payments found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $payments->links() }}</div>
    </x-panel>

    @if ($isTenant)
        <div x-show="uploadOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" style="display:none">
            <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg" @click.outside="uploadOpen = false">
                <h2 class="mb-4 text-lg font-semibold text-gray-900">Upload Payment Proof</h2>

                @if ($errors->any())
                    <div class="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <ul class="list-inside list-disc">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form id="payment-form" method="POST" action="{{ route('tenant.payments.store') }}" enctype="multipart/form-data" class="grid grid-cols-1 gap-3"
                      x-data="{ amount: {{ Js::from(old('amount', '')) }} }">
                    @csrf
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Bill</label>
                        <select required name="bill_id"
                                x-on:change="amount = $event.target.selectedOptions[0].dataset.amount || ''"
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="">Select an unpaid bill</option>
                            @foreach ($payableBills as $bill)
                                <option value="{{ $bill->id }}" data-amount="{{ $bill->amount }}" @selected(old('bill_id') == $bill->id)>
                                    {{ $bill->bill_month }}/{{ $bill->bill_year }} - Rp {{ number_format($bill->amount, 0, ',', '.') }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Amount</label>
                        <input required type="number" step="0.01" name="amount" x-model="amount" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Method</label>
                        <select name="method" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CASH">Cash</option>
                            <option value="E_WALLET">E-Wallet</option>
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Proof of Payment</label>
                        <input required type="file" name="proof" accept="image/*" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    </div>
                </form>

                <div class="mt-4 flex justify-end gap-2">
                    <button type="button" @click="uploadOpen = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button form="payment-form" type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Submit</button>
                </div>
            </div>
        </div>
    @endif
</div>

@endsection
