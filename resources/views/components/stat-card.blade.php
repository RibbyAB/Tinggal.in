@props([
    'label' => '',
    'value' => '',
    'sublabel' => null,
    'icon' => null,
    'variant' => 'plain',
    'iconTone' => 'primary',
    'progress' => null,
    'progressLabel' => null,
])

@php
    $variants = [
        'plain' => [
            'card' => 'border-white/70 bg-white/80 backdrop-blur-sm',
            'label' => 'text-gray-500',
            'value' => 'text-gray-900',
            'sub' => 'text-gray-400',
            'track' => 'bg-gray-100',
            'bar' => 'bg-primary-600',
        ],
        'soft' => [
            'card' => 'border-primary-100 bg-primary-50/80 backdrop-blur-sm',
            'label' => 'text-primary-700',
            'value' => 'text-gray-900',
            'sub' => 'text-primary-700/70',
            'track' => 'bg-primary-100',
            'bar' => 'bg-primary-600',
        ],
        'accent' => [
            'card' => 'border-primary-700 bg-gradient-to-br from-primary-600 to-primary-800',
            'label' => 'text-white/70',
            'value' => 'text-white',
            'sub' => 'text-white/60',
            'track' => 'bg-white/20',
            'bar' => 'bg-white',
        ],
    ];

    $icons = [
        'primary' => ['plain' => 'bg-primary-50 text-primary-700', 'soft' => 'bg-white text-primary-700', 'accent' => 'bg-white/15 text-white'],
        'warm' => ['plain' => 'bg-amber-50 text-amber-700', 'soft' => 'bg-white text-amber-700', 'accent' => 'bg-white/15 text-white'],
    ];

    $v = $variants[$variant] ?? $variants['plain'];
    $iconClass = ($icons[$iconTone] ?? $icons['primary'])[$variant] ?? $icons['primary']['plain'];
    $progressPct = is_numeric($progress) ? min(max((float) $progress, 0), 100) : null;
@endphp

<div class="rounded-2xl border p-5 shadow-sm shadow-primary-900/5 {{ $v['card'] }}">
    <div class="flex items-start justify-between gap-3">
        <dl class="min-w-0">
            <dt class="text-sm font-medium {{ $icon ? 'min-h-[2.25rem]' : '' }} {{ $v['label'] }}">{{ $label }}</dt>
            <dd class="mt-3 text-2xl font-semibold tracking-tight {{ $v['value'] }}">{{ $value }}</dd>
            @if ($sublabel)
                <dd class="mt-1 text-xs {{ $v['sub'] }}">{{ $sublabel }}</dd>
            @endif
        </dl>
        @if ($icon)
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl {{ $iconClass }}" aria-hidden="true">
                @include('partials.icons', ['icon' => $icon])
            </div>
        @endif
    </div>

    @if (!is_null($progressPct))
        <div class="mt-4">
            <div class="h-1.5 w-full overflow-hidden rounded-full {{ $v['track'] }}" aria-hidden="true">
                <div class="h-full rounded-full {{ $v['bar'] }}" style="width: {{ $progressPct }}%"></div>
            </div>
            @if ($progressLabel)
                <p class="mt-1.5 text-xs {{ $v['sub'] }}">{{ $progressLabel }}</p>
            @endif
        </div>
    @endif
</div>
