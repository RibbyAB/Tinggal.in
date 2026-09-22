@extends('layouts.app')

@php
    $prefix = strtolower(auth()->user()->role);
@endphp

@section('content')
<div class="space-y-4" x-data="{ modalOpen: {{ $errors->any() ? 'true' : 'false' }} }">
    <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-xl font-semibold text-gray-900">Rentals</h1>
            <p class="text-sm text-gray-500">Check-in / check-out records.</p>
        </div>
        <button type="button" @click="modalOpen = true" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            + New Check-In
        </button>
    </header>

    <x-panel title="Filters">
        <form method="GET" action="{{ route($prefix . '.rentals.index') }}" class="flex flex-wrap items-end gap-3">
            <div>
                <label class="block">
                    <span class="mb-1 block text-sm font-medium text-gray-700">Status</span>
                    <select name="status" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="">All Status</option>
                        @foreach (['ACTIVE', 'COMPLETED', 'CANCELLED'] as $s)
                            <option value="{{ $s }}" @selected(request('status') === $s)>{{ ucfirst(strtolower($s)) }}</option>
                        @endforeach
                    </select>
                </label>
            </div>
            <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Apply</button>
            <a href="{{ route($prefix . '.rentals.index') }}" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Reset</a>
        </form>
    </x-panel>

    <x-panel title="Rental List">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-100 text-gray-500">
                        <th scope="col" class="py-2 pr-4">Tenant</th>
                        <th scope="col" class="py-2 pr-4">Room</th>
                        <th scope="col" class="py-2 pr-4">Start Date</th>
                        <th scope="col" class="py-2 pr-4">End Date</th>
                        <th scope="col" class="py-2 pr-4">Monthly Price</th>
                        <th scope="col" class="py-2 pr-4">Status</th>
                        <th scope="col" class="py-2 pr-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($rentals as $rental)
                        <tr class="border-b border-gray-50">
                            <td class="py-2 pr-4 font-medium text-gray-900">{{ $rental->tenant->user->name ?? '-' }}</td>
                            <td class="py-2 pr-4">{{ $rental->room->room_number ?? '-' }}</td>
                            <td class="py-2 pr-4"><time datetime="{{ optional($rental->start_date)->format('Y-m-d') }}">{{ optional($rental->start_date)->format('d M Y') }}</time></td>
                            <td class="py-2 pr-4">@if ($rental->end_date)<time datetime="{{ $rental->end_date->format('Y-m-d') }}">{{ $rental->end_date->format('d M Y') }}</time>@else-@endif</td>
                            <td class="py-2 pr-4">Rp {{ number_format($rental->monthly_price, 0, ',', '.') }}</td>
                            <td class="py-2 pr-4"><x-status-badge :status="$rental->status" /></td>
                            <td class="py-2 pr-4">
                                @if ($rental->status === 'ACTIVE')
                                    <form method="POST" action="{{ route($prefix . '.rentals.checkout', $rental) }}" class="inline"
                                        onsubmit="return confirm('Check out this tenant?');">
                                        @csrf
                                        <button type="submit" class="text-clay-700 hover:underline">Check Out</button>
                                    </form>
                                @else
                                    <span class="text-gray-400">-</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-6 text-center text-gray-400">No rentals found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $rentals->links() }}</div>
    </x-panel>

    <dialog aria-labelledby="rentals-dialog-1"
            x-effect="(modalOpen) ? ($el.open || $el.showModal()) : ($el.open && $el.close())"
            x-on:close="modalOpen = false" @click.self="$el.close()"
            class="w-[calc(100%-2rem)] max-w-lg rounded-xl bg-transparent p-0 shadow-lg">
        <div class="rounded-xl bg-white p-6">
            <h2 id="rentals-dialog-1" class="mb-4 text-lg font-semibold text-gray-900">New Check-In</h2>

            @if ($errors->any())
                <div class="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <ul class="list-inside list-disc">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form id="rental-form" method="POST" action="{{ route($prefix . '.rentals.store') }}" class="grid grid-cols-1 gap-3">
                @csrf
                <div>
                    <label class="block">
                        <span class="mb-1 block text-sm font-medium text-gray-700">Tenant</span>
                        <select required name="tenant_id" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="">Select tenant</option>
                            @foreach ($availableTenants as $t)
                                <option value="{{ $t->id }}" @selected(old('tenant_id') == $t->id)>{{ $t->user->name }}</option>
                            @endforeach
                        </select>
                    </label>
                </div>
                <div>
                    <label class="block">
                        <span class="mb-1 block text-sm font-medium text-gray-700">Room</span>
                        <select required name="room_id" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="">Select available room</option>
                            @foreach ($availableRooms as $r)
                                <option value="{{ $r->id }}" @selected(old('room_id') == $r->id)>{{ $r->room_number }} - Rp {{ number_format($r->price, 0, ',', '.') }}</option>
                            @endforeach
                        </select>
                    </label>
                </div>
                <div>
                    <label class="block">
                        <span class="mb-1 block text-sm font-medium text-gray-700">Start Date</span>
                        <input required type="date" name="start_date" value="{{ old('start_date') }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    </label>
                </div>
                <div>
                    <label class="block">
                        <span class="mb-1 block text-sm font-medium text-gray-700">Notes</span>
                        <textarea name="notes" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">{{ old('notes') }}</textarea>
                    </label>
                </div>
            </form>

            <div class="mt-4 flex justify-end gap-2">
                <button type="button" @click="modalOpen = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button form="rental-form" type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Check In</button>
            </div>
        </div>
    </dialog>
</div>

@endsection
