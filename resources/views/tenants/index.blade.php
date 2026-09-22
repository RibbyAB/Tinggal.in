@extends('layouts.app')

@php
    $prefix = strtolower(auth()->user()->role);
@endphp

@section('content')
<div class="space-y-4" x-data="{ modalOpen: {{ $errors->any() ? 'true' : 'false' }} }">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-xl font-semibold text-gray-900">Tenants</h1>
            <p class="text-sm text-gray-500">Manage tenant accounts and records.</p>
        </div>
        <button type="button" @click="modalOpen = true" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            + Add Tenant
        </button>
    </div>

    <x-panel title="Filters">
        <form method="GET" action="{{ route($prefix . '.tenants.index') }}" class="flex flex-wrap items-end gap-3">
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Search</label>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search name or email..."
                    class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            </div>
            <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Apply</button>
            <a href="{{ route($prefix . '.tenants.index') }}" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Reset</a>
        </form>
    </x-panel>

    <x-panel title="Tenant List">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-100 text-gray-500">
                        <th class="py-2 pr-4">Name</th>
                        <th class="py-2 pr-4">Email</th>
                        <th class="py-2 pr-4">Phone</th>
                        <th class="py-2 pr-4">KTP</th>
                        <th class="py-2 pr-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($tenants as $tenant)
                        <tr class="border-b border-gray-50">
                            <td class="py-2 pr-4 font-medium text-gray-900">{{ $tenant->user->name }}</td>
                            <td class="py-2 pr-4">{{ $tenant->user->email }}</td>
                            <td class="py-2 pr-4">{{ $tenant->user->phone ?? '-' }}</td>
                            <td class="py-2 pr-4">{{ $tenant->ktp_number ?? '-' }}</td>
                            <td class="py-2 pr-4">
                                <a href="{{ route($prefix . '.tenants.show', $tenant) }}" class="text-primary-600 hover:underline">View</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="py-6 text-center text-gray-400">No tenants found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $tenants->links() }}</div>
    </x-panel>

    <div x-show="modalOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" style="display:none">
        <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg" @click.outside="modalOpen = false">
            <h2 class="mb-4 text-lg font-semibold text-gray-900">Add Tenant</h2>

            @if ($errors->any())
                <div class="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <ul class="list-inside list-disc">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form id="tenant-form" method="POST" action="{{ route($prefix . '.tenants.store') }}" class="grid grid-cols-2 gap-3">
                @csrf
                <div class="col-span-2">
                    <label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
                    <input required name="name" value="{{ old('name') }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    @error('name') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
                </div>
                <div class="col-span-2">
                    <label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
                    <input required type="email" name="email" value="{{ old('email') }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    @error('email') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
                </div>
                <div class="col-span-2">
                    <label class="mb-1 block text-sm font-medium text-gray-700">Password</label>
                    <input required type="password" name="password" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    @error('password') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                    <input name="phone" value="{{ old('phone') }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    @error('phone') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">KTP Number</label>
                    <input name="ktp_number" value="{{ old('ktp_number') }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                </div>
                <div class="col-span-2">
                    <label class="mb-1 block text-sm font-medium text-gray-700">Emergency Contact</label>
                    <input name="emergency_contact" value="{{ old('emergency_contact') }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                </div>
                <div class="col-span-2">
                    <label class="mb-1 block text-sm font-medium text-gray-700">Address</label>
                    <textarea name="address" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">{{ old('address') }}</textarea>
                </div>
            </form>

            <div class="mt-4 flex justify-end gap-2">
                <button type="button" @click="modalOpen = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button form="tenant-form" type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Save</button>
            </div>
        </div>
    </div>
</div>

@endsection
