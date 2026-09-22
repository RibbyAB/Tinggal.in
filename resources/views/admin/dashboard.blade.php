@extends('layouts.app')

@section('title', 'Overview · Tinggal.in')

@section('content')
    <div class="space-y-5">
        <div>
            <h1 class="text-2xl font-semibold tracking-tight text-gray-900">Overview</h1>
            <p class="text-sm text-gray-500">Halo, {{ explode(' ', auth()->user()->name)[0] }}. Ini tugas operasional hari ini.</p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <x-stat-card variant="accent" label="Pending Verification" :value="$data['pendingPayments']" sublabel="Menunggu persetujuan Owner" icon="receipt" />
            <x-stat-card variant="soft" label="Total Tenants" :value="$data['totalTenants']" sublabel="Penghuni aktif" icon="users" />
            <x-stat-card label="Available Rooms" :value="$data['availableRooms']" sublabel="Siap disewakan" icon="room" />
            <x-stat-card label="Active Complaints" :value="$data['activeComplaints']" sublabel="Open + In Progress" icon="chat" icon-tone="warm" />
        </div>

        <x-panel title="Recent Activity" subtitle="Aktivitas terbaru pada sistem">
            @if (count($data['recentActivity']) === 0)
                <p class="text-sm text-gray-400">No recent activity.</p>
            @else
                <ul class="divide-y divide-gray-100">
                    @foreach ($data['recentActivity'] as $log)
                        <li class="flex items-center justify-between gap-3 py-3 text-sm">
                            <div class="flex min-w-0 items-center gap-3">
                                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                                    @include('partials.icons', ['icon' => 'receipt'])
                                </div>
                                <div class="min-w-0">
                                    <p class="truncate font-medium text-gray-800">{{ str_replace('_', ' ', $log->action) }}</p>
                                    <p class="truncate text-xs text-gray-400">{{ $log->details }}</p>
                                </div>
                            </div>
                            <div class="shrink-0 text-right">
                                <p class="text-xs font-medium text-gray-600">{{ $log->user->name ?? 'System' }}</p>
                                <p class="text-xs text-gray-400">{{ optional($log->created_at)->format('d M Y') }}</p>
                            </div>
                        </li>
                    @endforeach
                </ul>
            @endif
        </x-panel>
    </div>
@endsection
