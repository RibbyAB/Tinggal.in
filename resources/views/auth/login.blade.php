@extends('layouts.guest')

@section('title', 'Login · Tinggal.in')

@section('content')
    <div class="organic-bg flex min-h-screen items-center justify-center px-4 py-8">
        <div class="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
            <div class="flex flex-col justify-center px-8 py-10 sm:px-12">
                <div class="mb-8">
                    <div class="mb-4 flex items-center gap-2.5">
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-lg font-bold text-white">
                            T
                        </div>
                        <span class="text-lg font-semibold tracking-tight text-gray-900">
                            Tinggal<span class="text-primary-600">.in</span>
                        </span>
                    </div>
                    <h1 class="text-2xl font-semibold tracking-tight text-gray-900">WELCOME BACK</h1>
                    <p class="mt-1 text-sm text-gray-500">Sign in to manage your kost.</p>
                </div>

                <form method="POST" action="{{ route('login.attempt') }}" class="space-y-4">
                    @csrf
                    <div>
                        <label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autofocus
                            value="{{ old('email') }}"
                            class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="Enter your email"
                        >
                    </div>
                    <div>
                        <label for="password" class="mb-1 block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            required
                            class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="••••••••"
                        >
                    </div>

                    @if ($errors->any())
                        <p class="text-sm text-red-600">{{ $errors->first('email') }}</p>
                    @endif

                    @if (session('error'))
                        <p class="text-sm text-red-600">{{ session('error') }}</p>
                    @endif

                    <button
                        type="submit"
                        class="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
                    >
                        Sign In
                    </button>
                </form>

                <div class="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                    <p class="mb-1 font-medium text-gray-600">Demo accounts (password: password123)</p>
                    <p>Owner: owner@tinggal.in</p>
                    <p>Admin: admin@tinggal.in</p>
                    <p>Tenant: tenant@tinggal.in</p>
                </div>
            </div>

            <div class="relative hidden min-h-[420px] md:block">
                <div class="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-center">
                    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-4.5a2.25 2.25 0 00-4.5 0V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
                        </svg>
                    </div>
                    <p class="text-sm font-medium text-white/90">
                        Tinggal<span class="text-white/60">.in</span>
                    </p>
                </div>

                <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
        </div>
    </div>
@endsection
