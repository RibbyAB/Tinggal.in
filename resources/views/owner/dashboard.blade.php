@extends('layouts.app')

@section('title', 'Overview · Tinggal.in')

@section('content')
    <div class="space-y-5">
        <header>
            <h1 class="text-2xl font-semibold tracking-tight text-gray-900">Overview</h1>
            <p class="text-sm text-gray-500">
                Selamat datang kembali, {{ explode(' ', auth()->user()->name)[0] }}. Berikut ringkasan kost kamu hari ini.
            </p>
        </header>

        <div class="grid gap-5 lg:grid-cols-3">
            <div class="lg:col-span-2">
                <x-panel title="Revenue Analytics" subtitle="Pendapatan {{ count($revenue) }} bulan terakhir" class="flex h-full flex-col">
                    <x-slot:action>
                        <div class="text-right">
                            <p class="text-lg font-semibold text-gray-900">{{ \App\Support\Money::format(collect($revenue)->sum('revenue')) }}</p>
                            <p class="text-xs text-gray-400">Total periode</p>
                        </div>
                    </x-slot:action>
                    <div class="flex-1" style="min-height: 280px;">
                        <canvas id="revenueChart" role="img" aria-label="Grafik pendapatan per bulan">Grafik pendapatan per bulan.</canvas>
                    </div>
                </x-panel>
            </div>

            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                <x-stat-card
                    label="Total Rooms"
                    :value="$data['total']"
                    :sublabel="$data['occupied'] . ' terisi · ' . $data['available'] . ' kosong'"
                    icon="room"
                    :progress="$data['occupancyRate']"
                    :progress-label="$data['occupancyRate'] . '% occupancy rate'"
                />
                <x-stat-card
                    variant="accent"
                    label="Monthly Revenue"
                    :value="\App\Support\Money::format($data['monthlyRevenue'])"
                    sublabel="Pendapatan bulan berjalan"
                    icon="money"
                />
                <x-stat-card
                    variant="soft"
                    label="Total Tenants"
                    :value="$data['totalTenants']"
                    sublabel="Penghuni aktif saat ini"
                    icon="users"
                />
            </div>
        </div>

        <div class="grid gap-5 lg:grid-cols-3">
            <x-panel title="Room Occupancy" subtitle="Distribusi status kamar" class="h-full">
                <div class="relative">
                    <canvas id="occupancyChart" height="220" role="img" aria-label="Diagram status kamar: terisi, tersedia, dan maintenance">Diagram status kamar: terisi, tersedia, dan maintenance.</canvas>
                    <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <p class="text-2xl font-semibold text-gray-900">{{ $data['total'] }}</p>
                        <p class="text-xs text-gray-400">Total kamar</p>
                    </div>
                </div>
                <ul class="mt-4 space-y-2">
                    @php
                        $occTotal = $data['total'] ?: 0;
                        $occEntries = [
                            ['name' => 'Occupied', 'value' => $data['occupied'], 'color' => '#357a45'],
                            ['name' => 'Available', 'value' => $data['available'], 'color' => '#6bb07e'],
                            ['name' => 'Maintenance', 'value' => $data['maintenance'], 'color' => '#d9a441'],
                        ];
                    @endphp
                    @foreach ($occEntries as $entry)
                        <li class="flex items-center justify-between text-sm">
                            <span class="flex items-center gap-2 text-gray-600">
                                <span class="h-2.5 w-2.5 rounded-full" style="background-color: {{ $entry['color'] }}"></span>
                                {{ $entry['name'] }}
                            </span>
                            <span class="font-medium text-gray-900">
                                {{ $entry['value'] }}
                                <span class="ml-1 text-xs font-normal text-gray-400">
                                    {{ $occTotal > 0 ? round(($entry['value'] / $occTotal) * 100) . '%' : '0%' }}
                                </span>
                            </span>
                        </li>
                    @endforeach
                </ul>
            </x-panel>

            <div class="lg:col-span-2">
                <x-panel title="Payment Status" subtitle="Rekap verifikasi pembayaran" class="flex h-full flex-col">
                    <div class="flex-1" style="min-height: 280px;">
                        <canvas id="paymentStatusChart" role="img" aria-label="Grafik jumlah pembayaran per status verifikasi">Grafik jumlah pembayaran per status verifikasi.</canvas>
                    </div>
                </x-panel>
            </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
            <x-stat-card
                label="Outstanding Bills"
                :value="$data['outstandingBills']"
                sublabel="Belum lunas / menunggu verifikasi"
                icon="alert"
                icon-tone="warm"
            />
            <x-stat-card
                label="Active Complaints"
                :value="$data['activeComplaints']"
                sublabel="Open + In Progress"
                icon="chat"
                icon-tone="warm"
            />
        </div>
    </div>
@endsection

@push('scripts')
<script>
    const revenueData = @json($revenue);
    const paymentStatusData = @json($paymentStatus);
    const occupancyData = { occupied: {{ $data['occupied'] }}, available: {{ $data['available'] }}, maintenance: {{ $data['maintenance'] }} };

    const MONTH_LABELS = { 1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'Mei',6:'Jun',7:'Jul',8:'Agu',9:'Sep',10:'Okt',11:'Nov',12:'Des' };
    function formatMonth(ym) {
        const [y, m] = ym.split('-');
        return (MONTH_LABELS[parseInt(m, 10)] || m) + ' ' + y.slice(2);
    }
    function formatRupiah(v) {
        return 'Rp ' + Number(v).toLocaleString('id-ID');
    }

    new Chart(document.getElementById('revenueChart'), {
        type: 'line',
        data: {
            labels: revenueData.map(d => formatMonth(d.month)),
            datasets: [{
                label: 'Revenue',
                data: revenueData.map(d => d.revenue),
                borderColor: '#357a45',
                borderWidth: 2.5,
                backgroundColor: (ctx) => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
                    g.addColorStop(0, 'rgba(53,122,69,0.35)');
                    g.addColorStop(1, 'rgba(53,122,69,0)');
                    return g;
                },
                fill: true,
                tension: 0.35,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#357a45',
            }],
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (c) => formatRupiah(c.parsed.y) } },
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: '#e6ede6' }, ticks: { callback: (v) => (v / 1000000) + 'jt' } },
            },
        },
    });

    new Chart(document.getElementById('occupancyChart'), {
        type: 'doughnut',
        data: {
            labels: ['Occupied', 'Available', 'Maintenance'],
            datasets: [{
                data: [occupancyData.occupied, occupancyData.available, occupancyData.maintenance],
                backgroundColor: ['#357a45', '#6bb07e', '#d9a441'],
                borderWidth: 0,
            }],
        },
        options: {
            cutout: '65%',
            plugins: { legend: { display: false } },
        },
    });

    new Chart(document.getElementById('paymentStatusChart'), {
        type: 'bar',
        data: {
            labels: paymentStatusData.map(d => d.status),
            datasets: [{
                data: paymentStatusData.map(d => d.count),
                backgroundColor: paymentStatusData.map(d => ({ APPROVED: '#357a45', PENDING: '#d9a441', REJECTED: '#b4553f' }[d.status] || '#bcdcc3')),
                borderRadius: 8,
                barPercentage: 0.6,
            }],
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: '#e6ede6' }, ticks: { precision: 0 } },
            },
        },
    });
</script>
@endpush
