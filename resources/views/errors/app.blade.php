@extends(auth()->check() ? 'layouts.app' : 'layouts.guest')

@section('title', $status.' · Tinggal.in')

@section('content')
<div class="flex min-h-[60vh] items-center justify-center px-4">
    <section class="w-full max-w-md rounded-2xl border border-white/70 bg-white/80 p-8 text-center shadow-sm shadow-primary-900/5 backdrop-blur-sm">
        <h1 class="text-5xl font-semibold tracking-tight text-primary-700">{{ $status }}</h1>

        <p class="mt-3 text-sm text-gray-600">{{ $message }}</p>

        @auth
            @php
                $home = match (auth()->user()->role) {
                    'OWNER' => route('owner.dashboard'),
                    'ADMIN' => route('admin.dashboard'),
                    default => route('tenant.dashboard'),
                };
            @endphp
            <p class="mt-4 text-xs text-gray-400">
                Masuk sebagai {{ auth()->user()->name }} ({{ auth()->user()->role }})
            </p>
            <div class="mt-6 flex items-center justify-center gap-2">
                <a href="{{ $home }}"
                   class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                    Kembali ke Dashboard
                </a>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit"
                            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Logout
                    </button>
                </form>
            </div>
        @else
            <a href="{{ route('login') }}"
               class="mt-6 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Ke Halaman Login
            </a>
        @endauth
    </section>
</div>
@endsection
