@extends('layouts.app')

@section('title', 'Overview · Tinggal.in')

@section('content')
    <div class="space-y-5">
        <header>
            <h1 class="text-2xl font-semibold tracking-tight text-gray-900">Overview</h1>
            <p class="text-sm text-gray-500">Halo, {{ explode(' ', auth()->user()->name)[0] }}. Ini tugas operasional hari ini.</p>
        </header>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <x-stat-card variant="accent" label="Pending Verification" :value="$data['pendingPayments']" sublabel="Menunggu persetujuan Owner" icon="receipt" />
            <x-stat-card variant="soft" label="Total Tenants" :value="$data['totalTenants']" sublabel="Penghuni aktif" icon="users" />
            <x-stat-card label="Available Rooms" :value="$data['availableRooms']" sublabel="Siap disewakan" icon="room" />
            <x-stat-card label="Active Complaints" :value="$data['activeComplaints']" sublabel="Open + In Progress" icon="chat" icon-tone="warm" />
        </div>

        <x-panel title="Komplain Perlu Ditangani" subtitle="Status Open dan In Progress">
            <x-slot:action>
                <a href="{{ route('admin.complaints.index') }}" class="text-sm font-medium text-primary-700 hover:text-primary-800">
                    Lihat semua
                </a>
            </x-slot:action>

            @if (count($data['recentComplaints']) === 0)
                <p class="text-sm text-gray-400">Tidak ada komplain yang perlu ditangani.</p>
            @else
                <ul class="divide-y divide-gray-100">
                    @foreach ($data['recentComplaints'] as $complaint)
                        <li class="flex items-center justify-between gap-3 py-3 text-sm">
                            <div class="flex min-w-0 items-center gap-3">
                                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                                    @include('partials.icons', ['icon' => 'chat'])
                                </div>
                                <div class="min-w-0">
                                    <a href="{{ route('admin.complaints.show', $complaint) }}" class="truncate font-medium text-gray-800 hover:text-primary-700">
                                        {{ $complaint->title }}
                                    </a>
                                    <p class="truncate text-xs text-gray-400">
                                        {{ $complaint->tenant->user->name ?? '-' }} &middot; {{ ucfirst(strtolower($complaint->category)) }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex shrink-0 items-center gap-2">
                                <x-status-badge :status="$complaint->priority" />
                                <x-status-badge :status="$complaint->status" />
                            </div>
                        </li>
                    @endforeach
                </ul>
            @endif
        </x-panel>
    </div>
@endsection
