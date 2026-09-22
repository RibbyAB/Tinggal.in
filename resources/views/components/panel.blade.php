@props(['title' => null, 'subtitle' => null])

<section {{ $attributes->merge(['class' => 'rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm shadow-primary-900/5 backdrop-blur-sm']) }}>
    @if ($title || $subtitle || isset($action))
        <header class="mb-4 flex items-start justify-between gap-3">
            <div>
                @if ($title)
                    <h3 class="text-sm font-semibold text-gray-900">{{ $title }}</h3>
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
