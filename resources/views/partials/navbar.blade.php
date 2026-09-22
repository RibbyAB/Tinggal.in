<header class="sticky top-0 z-10 flex h-16 items-center justify-end border-b border-white/60 bg-white/70 px-4 backdrop-blur-md lg:px-6">
    <div class="flex items-center gap-3">
        <div class="text-right">
            <p class="text-sm font-medium text-gray-900">{{ auth()->user()->name }}</p>
            <p class="text-xs text-gray-400">{{ auth()->user()->role }}</p>
        </div>
        <div aria-hidden="true" class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
        </div>
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Logout
            </button>
        </form>
    </div>
</header>
