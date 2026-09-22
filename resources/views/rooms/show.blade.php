@extends('layouts.app')

@section('title', 'Room ' . $room->room_number . ' · Tinggal.in')

@php
    $prefix = strtolower(auth()->user()->role);
    $activeRental = $room->rentals->firstWhere('status', 'ACTIVE');
    $facilities = collect(explode(',', (string) $room->facilities))
        ->map(fn ($f) => trim($f))
        ->filter()
        ->values();
@endphp

@section('content')
<div class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
            <h1 class="text-xl font-semibold text-gray-900">Room {{ $room->room_number }}</h1>
            <p class="text-sm text-gray-500">Detail kamar dan penghuni saat ini.</p>
        </div>
        <a href="{{ route($prefix . '.rooms.index') }}"
           class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            &larr; Back to Rooms
        </a>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2">
            <x-panel title="Room Details">
                <x-slot:action>
                    <x-status-badge :status="$room->status" />
                </x-slot:action>

                <dl class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                    <div>
                        <dt class="text-gray-500">Room Number</dt>
                        <dd class="font-medium text-gray-900">{{ $room->room_number }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500">Floor</dt>
                        <dd class="font-medium text-gray-900">{{ $room->floor }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500">Type</dt>
                        <dd class="font-medium text-gray-900">{{ $room->type }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500">Monthly Price</dt>
                        <dd class="font-medium text-gray-900">{{ \App\Support\Money::format($room->price) }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500">Capacity</dt>
                        <dd class="font-medium text-gray-900">{{ $room->capacity }} orang</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500">Status</dt>
                        <dd><x-status-badge :status="$room->status" /></dd>
                    </div>
                </dl>

                <div class="mt-5 border-t border-gray-100 pt-4">
                    <p class="mb-2 text-sm text-gray-500">Facilities</p>
                    @if ($facilities->isNotEmpty())
                        <div class="flex flex-wrap gap-2">
                            @foreach ($facilities as $facility)
                                <span class="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
                                    {{ $facility }}
                                </span>
                            @endforeach
                        </div>
                    @else
                        <p class="text-sm text-gray-400">Belum ada fasilitas tercatat.</p>
                    @endif
                </div>

                @if ($room->description)
                    <div class="mt-4 border-t border-gray-100 pt-4">
                        <p class="mb-1 text-sm text-gray-500">Description</p>
                        <p class="text-sm text-gray-700">{{ $room->description }}</p>
                    </div>
                @endif
            </x-panel>
        </div>

        <x-panel title="Current Tenant" class="h-full">
            @if ($activeRental)
                <dl class="space-y-3 text-sm">
                    <div>
                        <dt class="text-gray-500">Name</dt>
                        <dd class="font-medium text-gray-900">{{ $activeRental->tenant->user->name ?? '-' }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500">Phone</dt>
                        <dd class="font-medium text-gray-900">{{ $activeRental->tenant->user->phone ?? '-' }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500">Start Date</dt>
                        <dd class="font-medium text-gray-900">{{ optional($activeRental->start_date)->format('d M Y') }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500">Monthly Price</dt>
                        <dd class="font-medium text-gray-900">{{ \App\Support\Money::format($activeRental->monthly_price) }}</dd>
                    </div>
                </dl>

                <a href="{{ route($prefix . '.tenants.show', $activeRental->tenant_id) }}"
                   class="mt-4 inline-block text-sm font-medium text-primary-700 hover:text-primary-800">
                    View tenant profile &rarr;
                </a>
            @else
                <p class="text-sm text-gray-400">
                    Kamar ini sedang tidak dihuni.
                </p>
            @endif
        </x-panel>
    </div>
</div>
@endsection
