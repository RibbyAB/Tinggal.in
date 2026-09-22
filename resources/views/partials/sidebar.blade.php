@php
    $role = auth()->user()->role;

    $links = match ($role) {
        'OWNER' => [
            ['route' => 'owner.dashboard', 'pattern' => 'owner.dashboard', 'label' => 'Dashboard'],
            ['route' => 'owner.rooms.index', 'pattern' => 'owner.rooms.*', 'label' => 'Rooms'],
            ['route' => 'owner.tenants.index', 'pattern' => 'owner.tenants.*', 'label' => 'Tenants'],
            ['route' => 'owner.rentals.index', 'pattern' => 'owner.rentals.*', 'label' => 'Rentals'],
            ['route' => 'owner.bills.index', 'pattern' => 'owner.bills.*', 'label' => 'Bills'],
            ['route' => 'owner.payments.index', 'pattern' => 'owner.payments.*', 'label' => 'Payments'],
            ['route' => 'owner.complaints.index', 'pattern' => 'owner.complaints.*', 'label' => 'Complaints'],
            ['route' => 'owner.reports.index', 'pattern' => 'owner.reports.*', 'label' => 'Reports'],
            ['route' => 'activity-logs.index', 'pattern' => 'activity-logs.*', 'label' => 'Activity Logs'],
        ],
        'ADMIN' => [
            ['route' => 'admin.dashboard', 'pattern' => 'admin.dashboard', 'label' => 'Dashboard'],
            ['route' => 'admin.rooms.index', 'pattern' => 'admin.rooms.*', 'label' => 'Rooms'],
            ['route' => 'admin.tenants.index', 'pattern' => 'admin.tenants.*', 'label' => 'Tenants'],
            ['route' => 'admin.rentals.index', 'pattern' => 'admin.rentals.*', 'label' => 'Rentals'],
            ['route' => 'admin.bills.index', 'pattern' => 'admin.bills.*', 'label' => 'Bills'],
            ['route' => 'admin.payments.index', 'pattern' => 'admin.payments.*', 'label' => 'Payments'],
            ['route' => 'admin.complaints.index', 'pattern' => 'admin.complaints.*', 'label' => 'Complaints'],
        ],
        default => [
            ['route' => 'tenant.dashboard', 'pattern' => 'tenant.dashboard', 'label' => 'Dashboard'],
            ['route' => 'tenant.bills.index', 'pattern' => 'tenant.bills.*', 'label' => 'My Bills'],
            ['route' => 'tenant.payments.index', 'pattern' => 'tenant.payments.*', 'label' => 'Payments'],
            ['route' => 'tenant.complaints.index', 'pattern' => 'tenant.complaints.*', 'label' => 'Complaints'],
            ['route' => 'tenant.profile', 'pattern' => 'tenant.profile*', 'label' => 'Profile'],
        ],
    };

    $roleTitle = ucfirst(strtolower($role));
@endphp

<aside class="w-64 shrink-0 bg-primary-800 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto">
    <div class="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <img src="{{ asset('images/logo.png') }}" alt="Tinggal.in" class="h-8 w-8 rounded-lg object-cover">
        <div>
            <p class="text-sm font-semibold text-white">
                Tinggal<span class="text-primary-300">.in</span>
            </p>
            <p class="text-xs text-primary-200">{{ $roleTitle }}</p>
        </div>
    </div>

    <nav class="flex flex-col gap-1 p-3">
        @foreach ($links as $link)
            <a href="{{ route($link['route']) }}"
               class="rounded-lg px-3 py-2 text-sm font-medium transition-colors {{ request()->routeIs($link['pattern']) ? 'bg-white/15 text-white' : 'text-primary-100/70 hover:bg-white/10 hover:text-white' }}">
                {{ $link['label'] }}
            </a>
        @endforeach
    </nav>
</aside>
