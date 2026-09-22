@extends('layouts.app')

@php
    $role = auth()->user()->role;
    $prefix = strtolower($role);
    $isTenant = $role === 'TENANT';
    $monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
@endphp

@section('content')
<div class="space-y-4">
    <div>
        <h1 class="text-xl font-semibold text-gray-900">Bill #{{ $bill->id }}</h1>
        <p class="text-sm text-gray-500">{{ $monthNames[$bill->bill_month] }} {{ $bill->bill_year }}</p>
    </div>

    <x-panel title="Bill Details">
        <dl class="grid grid-cols-2 gap-4 text-sm">
            @unless ($isTenant)
                <div>
                    <dt class="text-gray-500">Tenant</dt>
                    <dd class="font-medium text-gray-900">{{ $bill->rental->tenant->user->name ?? '-' }}</dd>
                </div>
            @endunless
            <div>
                <dt class="text-gray-500">Room</dt>
                <dd class="font-medium text-gray-900">{{ $bill->rental->room->room_number ?? '-' }}</dd>
            </div>
            <div>
                <dt class="text-gray-500">Amount</dt>
                <dd class="font-medium text-gray-900">Rp {{ number_format($bill->amount, 0, ',', '.') }}</dd>
            </div>
            <div>
                <dt class="text-gray-500">Due Date</dt>
                <dd class="font-medium text-gray-900">{{ optional($bill->due_date)->format('d M Y') }}</dd>
            </div>
            <div>
                <dt class="text-gray-500">Status</dt>
                <dd><x-status-badge :status="$bill->status" /></dd>
            </div>
        </dl>
    </x-panel>

    <x-panel title="Payments">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-100 text-gray-500">
                        <th class="py-2 pr-4">Amount</th>
                        <th class="py-2 pr-4">Method</th>
                        <th class="py-2 pr-4">Status</th>
                        <th class="py-2 pr-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($bill->payments as $payment)
                        <tr class="border-b border-gray-50">
                            <td class="py-2 pr-4">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                            <td class="py-2 pr-4">{{ $payment->method ? ucfirst(strtolower(str_replace('_', ' ', $payment->method))) : '-' }}</td>
                            <td class="py-2 pr-4"><x-status-badge :status="$payment->status" /></td>
                            <td class="py-2 pr-4">
                                <a href="{{ route($prefix . '.payments.show', $payment) }}" class="text-primary-600 hover:underline">View</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="py-6 text-center text-gray-400">No payments submitted for this bill yet.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-panel>

    <a href="{{ route($prefix . '.bills.index') }}" class="text-sm text-primary-600 hover:underline">&larr; Back to Bills</a>
</div>
@endsection
