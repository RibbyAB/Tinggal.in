@extends('layouts.app')

@section('title', 'Overview · Tinggal.in')

@php
    $rental = $data['rental'];
    $currentBill = $data['currentBill'];
    $recentPayments = $data['recentPayments'];
    $complaints = $data['complaints'];

    $monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
@endphp

@section('content')
    <div class="space-y-5">
        <header>
            <h1 class="text-2xl font-semibold tracking-tight text-gray-900">Overview</h1>
            <p class="text-sm text-gray-500">
                Halo, {{ explode(' ', auth()->user()->name)[0] }}. Berikut ringkasan kamar dan tagihan kamu.
            </p>
        </header>

        @if (!$rental)
            <div class="rounded-2xl border border-white/70 bg-white/80 p-8 text-center shadow-sm">
                <h2 class="text-base font-semibold text-gray-900">No active rental</h2>
                <p class="mt-1 text-sm text-gray-500">You currently do not have an active room rental.</p>
            </div>
        @else
            <div class="grid gap-5 lg:grid-cols-3">
                <div class="rounded-2xl border border-primary-700 bg-gradient-to-br from-primary-600 to-primary-800 p-6 shadow-sm shadow-primary-900/10 lg:col-span-2">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-medium text-white/70">Current Bill</p>
                            @if ($currentBill)
                                <p class="mt-1 text-xs text-white/60">
                                    {{ $monthNames[$currentBill->bill_month] ?? $currentBill->bill_month }} {{ $currentBill->bill_year }}
                                </p>
                                <p class="mt-3 text-3xl font-semibold tracking-tight text-white">
                                    {{ \App\Support\Money::format($currentBill->amount) }}
                                </p>
                                <p class="mt-1 text-sm text-white/70">Jatuh tempo <time datetime="{{ optional($currentBill->due_date)->format('Y-m-d') }}">{{ optional($currentBill->due_date)->format('d M Y') }}</time></p>
                            @else
                                <p class="mt-3 text-sm text-white/70">Belum ada tagihan untuk sewa ini.</p>
                            @endif
                        </div>

                        @if ($currentBill)
                            <div class="flex flex-col items-end gap-3">
                                <x-status-badge :status="$currentBill->status" />
                                @if ($currentBill->status === 'UNPAID')
                                    <a href="{{ route('tenant.payments.index') }}"
                                       class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50">
                                        Pay Now
                                    </a>
                                @endif
                            </div>
                        @endif
                    </div>
                </div>

                <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                    <x-stat-card
                        label="Room"
                        :value="$rental->room->room_number"
                        :sublabel="$rental->room->type . ' · Lantai ' . $rental->room->floor"
                        icon="room"
                    />
                    <x-stat-card
                        variant="soft"
                        label="Monthly Price"
                        :value="\App\Support\Money::format($rental->monthly_price)"
                        sublabel="Harga sewa per bulan"
                        icon="money"
                    />
                </div>
            </div>

            <div class="grid gap-5 lg:grid-cols-3">
                <x-stat-card
                    label="Tenant Since"
                    :value="optional($rental->start_date)->format('d M Y')"
                    sublabel="Tanggal mulai sewa"
                    icon="calendar"
                />

                <x-panel title="Recent Payments" subtitle="Riwayat pembayaran terakhir">
                    @if (count($recentPayments) === 0)
                        <p class="text-sm text-gray-400">No payments yet.</p>
                    @else
                        <ul class="divide-y divide-gray-100">
                            @foreach ($recentPayments as $p)
                                <li class="flex items-center justify-between gap-3 py-2.5 text-sm">
                                    <span class="text-gray-600"><time datetime="{{ optional($p->paid_at ?? $p->created_at)->format('Y-m-d') }}">{{ optional($p->paid_at ?? $p->created_at)->format('d M Y') }}</time></span>
                                    <span class="font-medium text-gray-900">{{ \App\Support\Money::format($p->amount) }}</span>
                                    <x-status-badge :status="$p->status" />
                                </li>
                            @endforeach
                        </ul>
                    @endif
                </x-panel>

                <x-panel title="Complaint Status" subtitle="Keluhan yang kamu ajukan">
                    <x-slot:action>
                        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            @include('partials.icons', ['icon' => 'chat'])
                        </div>
                    </x-slot:action>
                    @if (count($complaints) === 0)
                        <p class="text-sm text-gray-400">No complaints submitted.</p>
                    @else
                        <ul class="divide-y divide-gray-100">
                            @foreach ($complaints as $c)
                                <li class="flex items-center justify-between gap-3 py-2.5 text-sm">
                                    <span class="truncate text-gray-600">{{ $c->title }}</span>
                                    <x-status-badge :status="$c->status" />
                                </li>
                            @endforeach
                        </ul>
                    @endif
                </x-panel>
            </div>
        @endif
    </div>
@endsection
