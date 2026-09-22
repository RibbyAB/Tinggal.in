@props(['status' => null])

@php
    $good = 'bg-primary-100 text-primary-800';
    $fresh = 'bg-lime-100 text-lime-800';
    $wait = 'bg-amber-100 text-amber-800';
    $bad = 'bg-clay-100 text-clay-700';
    $neutral = 'bg-stone-100 text-stone-700';

    $map = [
        'AVAILABLE' => $fresh,
        'OCCUPIED' => $good,
        'MAINTENANCE' => $wait,

        'ACTIVE' => $good,
        'COMPLETED' => $neutral,
        'CANCELLED' => $bad,

        'UNPAID' => $bad,
        'PENDING_VERIFICATION' => $wait,
        'PAID' => $good,
        'OVERDUE' => $bad,

        'PENDING' => $wait,
        'APPROVED' => $good,
        'REJECTED' => $bad,

        'OPEN' => $bad,
        'IN_PROGRESS' => $wait,
        'RESOLVED' => $good,
        'CLOSED' => $neutral,

        'LOW' => $neutral,
        'MEDIUM' => $wait,
        'HIGH' => $bad,
    ];

    $classes = $map[$status] ?? $neutral;
@endphp

<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium {{ $classes }}">
    {{ str_replace('_', ' ', $status ?? '') }}
</span>
