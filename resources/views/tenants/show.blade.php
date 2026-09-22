@extends('layouts.app')

@php
    $prefix = strtolower(auth()->user()->role);
@endphp

@section('content')
<div class="space-y-4">
    <div>
        <h1 class="text-xl font-semibold text-gray-900">{{ $tenant->user->name }}</h1>
        <p class="text-sm text-gray-500">Tenant profile and rental history.</p>
    </div>

    <x-panel title="Profile">
        @if ($errors->any())
            <div class="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <ul class="list-inside list-disc">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route($prefix . '.tenants.update', $tenant) }}" class="grid grid-cols-2 gap-3">
            @csrf
            @method('PUT')
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input name="name" value="{{ old('name', $tenant->user->name) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                @error('name') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value="{{ old('email', $tenant->user->email) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                @error('email') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input name="phone" value="{{ old('phone', $tenant->user->phone) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                @error('phone') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">KTP Number</label>
                <input name="ktp_number" value="{{ old('ktp_number', $tenant->ktp_number) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Emergency Contact</label>
                <input name="emergency_contact" value="{{ old('emergency_contact', $tenant->emergency_contact) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            </div>
            <div class="col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">{{ old('address', $tenant->address) }}</textarea>
            </div>
            <div class="col-span-2">
                <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Save Changes</button>
            </div>
        </form>
    </x-panel>

    <x-panel title="Rental History">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-100 text-gray-500">
                        <th class="py-2 pr-4">Room</th>
                        <th class="py-2 pr-4">Start Date</th>
                        <th class="py-2 pr-4">End Date</th>
                        <th class="py-2 pr-4">Monthly Price</th>
                        <th class="py-2 pr-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($tenant->rentals as $rental)
                        <tr class="border-b border-gray-50">
                            <td class="py-2 pr-4 font-medium text-gray-900">{{ $rental->room->room_number ?? '-' }}</td>
                            <td class="py-2 pr-4">{{ optional($rental->start_date)->format('d M Y') }}</td>
                            <td class="py-2 pr-4">{{ $rental->end_date ? $rental->end_date->format('d M Y') : '-' }}</td>
                            <td class="py-2 pr-4">Rp {{ number_format($rental->monthly_price, 0, ',', '.') }}</td>
                            <td class="py-2 pr-4"><x-status-badge :status="$rental->status" /></td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="py-6 text-center text-gray-400">No rental history.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-panel>
</div>
@endsection
