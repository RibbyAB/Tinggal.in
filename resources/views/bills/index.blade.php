@extends('layouts.app')

@php
    $role = auth()->user()->role;
    $prefix = strtolower($role);
    $isTenant = $role === 'TENANT';
    $canGenerate = ! $isTenant;
    $monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
@endphp

@section('content')
<div class="space-y-4" x-data="{ modalOpen: {{ $errors->any() ? 'true' : 'false' }} }">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-xl font-semibold text-gray-900">{{ $isTenant ? 'My Bills' : 'Bills' }}</h1>
            <p class="text-sm text-gray-500">{{ $isTenant ? 'View your monthly bills.' : 'Generate and track tenant bills.' }}</p>
        </div>
        @if ($canGenerate)
            <button type="button" @click="modalOpen = true" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                + Generate Bill
            </button>
        @endif
    </div>

    <x-panel title="Filters">
        <form method="GET" action="{{ route($prefix . '.bills.index') }}" class="flex flex-wrap items-end gap-3">
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select name="status" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">All Status</option>
                    @foreach (['UNPAID', 'PENDING_VERIFICATION', 'PAID', 'OVERDUE'] as $s)
                        <option value="{{ $s }}" @selected(request('status') === $s)>{{ ucfirst(strtolower(str_replace('_', ' ', $s))) }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Month</label>
                <select name="month" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">All Months</option>
                    @for ($m = 1; $m <= 12; $m++)
                        <option value="{{ $m }}" @selected((string) request('month') === (string) $m)>{{ $monthNames[$m] }}</option>
                    @endfor
                </select>
            </div>
            <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Apply</button>
            <a href="{{ route($prefix . '.bills.index') }}" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Reset</a>
        </form>
    </x-panel>

    <x-panel title="Bill List">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-100 text-gray-500">
                        @unless ($isTenant)
                            <th class="py-2 pr-4">Tenant</th>
                        @endunless
                        <th class="py-2 pr-4">Room</th>
                        <th class="py-2 pr-4">Period</th>
                        <th class="py-2 pr-4">Amount</th>
                        <th class="py-2 pr-4">Due Date</th>
                        <th class="py-2 pr-4">Status</th>
                        <th class="py-2 pr-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($bills as $bill)
                        <tr class="border-b border-gray-50">
                            @unless ($isTenant)
                                <td class="py-2 pr-4 font-medium text-gray-900">{{ $bill->rental->tenant->user->name ?? '-' }}</td>
                            @endunless
                            <td class="py-2 pr-4">{{ $bill->rental->room->room_number ?? '-' }}</td>
                            <td class="py-2 pr-4">{{ $monthNames[$bill->bill_month] }} {{ $bill->bill_year }}</td>
                            <td class="py-2 pr-4">Rp {{ number_format($bill->amount, 0, ',', '.') }}</td>
                            <td class="py-2 pr-4">{{ optional($bill->due_date)->format('d M Y') }}</td>
                            <td class="py-2 pr-4"><x-status-badge :status="$bill->status" /></td>
                            <td class="py-2 pr-4">
                                <a href="{{ route($prefix . '.bills.show', $bill) }}" class="text-primary-600 hover:underline">View</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="{{ $isTenant ? 6 : 7 }}" class="py-6 text-center text-gray-400">No bills found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $bills->links() }}</div>
    </x-panel>

    @if ($canGenerate)
        <div x-show="modalOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" style="display:none">
            <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg" @click.outside="modalOpen = false">
                <h2 class="mb-4 text-lg font-semibold text-gray-900">Generate Bill</h2>

                @if ($errors->any())
                    <div class="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <ul class="list-inside list-disc">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form id="bill-form" method="POST" action="{{ route($prefix . '.bills.generate') }}" class="grid grid-cols-2 gap-3">
                    @csrf
                    <div class="col-span-2">
                        <label class="mb-1 block text-sm font-medium text-gray-700">Rental</label>
                        <select required name="rental_id" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="">Select active rental</option>
                            @foreach ($billableRentals as $rental)
                                <option value="{{ $rental->id }}" @selected(old('rental_id') == $rental->id)>
                                    {{ $rental->tenant->user->name ?? '-' }} - {{ $rental->room->room_number ?? '-' }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Bill Month</label>
                        <select required name="bill_month" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            @for ($m = 1; $m <= 12; $m++)
                                <option value="{{ $m }}" @selected((old('bill_month') ?: now()->month) == $m)>{{ $monthNames[$m] }}</option>
                            @endfor
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Bill Year</label>
                        <input required type="number" name="bill_year" value="{{ old('bill_year', now()->year) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    </div>
                    <div class="col-span-2">
                        <label class="mb-1 block text-sm font-medium text-gray-700">Due Date</label>
                        <input required type="date" name="due_date" value="{{ old('due_date') }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    </div>
                </form>

                <div class="mt-4 flex justify-end gap-2">
                    <button type="button" @click="modalOpen = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button form="bill-form" type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Generate</button>
                </div>
            </div>
        </div>

    @endif
</div>
@endsection
