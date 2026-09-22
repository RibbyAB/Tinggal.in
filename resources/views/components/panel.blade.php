@props(['title' => null, 'subtitle' => null])

@php
    $headingId = $title
        ? 'panel-' . \Illuminate\Support\Str::slug($title) . '-' . \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(4))
        : null;
@endphp

<section @if ($headingId) aria-labelledby="{{ $headingId }}" @endif {{ $attributes->merge(['class' => 'rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm shadow-primary-900/5 backdrop-blur-sm']) }}>
    @if ($title || $subtitle || isset($action))
        <header class="mb-4 flex items-start justify-between gap-3">
            <div>
                @if ($title)
                    <h2 id="{{ $headingId }}" class="text-sm font-semibold text-gray-900">{{ $title }}</h2>
                @endif
                @if ($subtitle)
                    <p class="mt-0.5 text-xs text-gray-400">{{ $subtitle }}</p>
                @endif
            </div>
            @isset($action)
                {{ $action }}
            @endisset
        </header>
    @endif

    {{ $slot }}
</section>
