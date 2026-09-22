@extends('layouts.app')

@php
    $role = auth()->user()->role;
    $prefix = strtolower($role);
    $isTenant = $role === 'TENANT';
    $statusFlow = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
@endphp

@section('content')
<div class="space-y-4" x-data="{ statusTarget: null, newOpen: {{ $errors->any() ? 'true' : 'false' }} }">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-xl font-semibold text-gray-900">{{ $isTenant ? 'My Complaints' : 'Complaints' }}</h1>
            <p class="text-sm text-gray-500">{{ $isTenant ? 'Submit and track your complaints.' : 'Track and resolve tenant complaints.' }}</p>
        </div>
        @if ($isTenant)
            <button type="button" @click="newOpen = true" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                + New Complaint
            </button>
        @endif
    </div>

    @unless ($isTenant)
        <x-panel title="Filters">
            <form method="GET" action="{{ route($prefix . '.complaints.index') }}" class="flex flex-wrap items-end gap-3">
                <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="">All Status</option>
                        @foreach ($statusFlow as $s)
                            <option value="{{ $s }}" @selected(request('status') === $s)>{{ ucfirst(strtolower(str_replace('_', ' ', $s))) }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">Category</label>
                    <select name="category" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="">All Categories</option>
                        @foreach (['ELECTRICITY', 'WATER', 'FACILITY', 'CLEANLINESS', 'SECURITY', 'OTHER'] as $c)
                            <option value="{{ $c }}" @selected(request('category') === $c)>{{ ucfirst(strtolower($c)) }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                    <select name="priority" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="">All Priorities</option>
                        @foreach (['LOW', 'MEDIUM', 'HIGH'] as $p)
                            <option value="{{ $p }}" @selected(request('priority') === $p)>{{ ucfirst(strtolower($p)) }}</option>
                        @endforeach
                    </select>
                </div>
                <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Apply</button>
                <a href="{{ route($prefix . '.complaints.index') }}" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Reset</a>
            </form>
        </x-panel>
    @endunless

    <x-panel title="Complaint List">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-100 text-gray-500">
                        @unless ($isTenant)
                            <th class="py-2 pr-4">Tenant</th>
                        @endunless
                        <th class="py-2 pr-4">Title</th>
                        <th class="py-2 pr-4">Category</th>
                        <th class="py-2 pr-4">Priority</th>
                        <th class="py-2 pr-4">Status</th>
                        <th class="py-2 pr-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($complaints as $complaint)
                        <tr class="border-b border-gray-50">
                            @unless ($isTenant)
                                <td class="py-2 pr-4 font-medium text-gray-900">{{ $complaint->tenant->user->name ?? '-' }}</td>
                            @endunless
                            <td class="py-2 pr-4">{{ $complaint->title }}</td>
                            <td class="py-2 pr-4">{{ ucfirst(strtolower($complaint->category ?? 'other')) }}</td>
                            <td class="py-2 pr-4">{{ ucfirst(strtolower($complaint->priority ?? 'low')) }}</td>
                            <td class="py-2 pr-4"><x-status-badge :status="$complaint->status" /></td>
                            <td class="py-2 pr-4">
                                <div class="flex gap-2">
                                    <a href="{{ route($prefix . '.complaints.show', $complaint) }}" class="text-primary-600 hover:underline">View</a>
                                    @unless ($isTenant)
                                        <button type="button" class="text-primary-600 hover:underline" @click="statusTarget = {{ $complaint->id }}">Update Status</button>
                                    @endunless
                                </div>
                            </td>
                        </tr>

                    @empty
                        <tr>
                            <td colspan="{{ $isTenant ? 5 : 6 }}" class="py-6 text-center text-gray-400">No complaints found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $complaints->links() }}</div>
    </x-panel>

    @unless ($isTenant)
        @foreach ($complaints as $complaint)
        <div x-show="statusTarget === {{ $complaint->id }}" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" style="display:none">
            <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg" @click.outside="statusTarget = null">
                <h3 class="mb-3 text-lg font-semibold text-gray-900">Update Complaint Status</h3>
                <p class="mb-3 text-sm text-gray-500">{{ $complaint->title }}</p>

                <form method="POST" action="{{ route($prefix . '.complaints.status', $complaint) }}" class="space-y-3">
                    @csrf
                    @method('PATCH')
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            @foreach ($statusFlow as $s)
                                <option value="{{ $s }}" @selected($complaint->status === $s)>{{ ucfirst(strtolower(str_replace('_', ' ', $s))) }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Note (optional)</label>
                        <textarea name="note" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"></textarea>
                    </div>

                    @if ($complaint->updates->count())
                        <div>
                            <p class="mb-1 text-sm font-medium text-gray-700">History</p>
                            <ul class="space-y-1 text-xs text-gray-500">
                                @foreach ($complaint->updates as $update)
                                    <li>{{ optional($update->created_at)->format('d M Y H:i') }} &mdash; {{ $update->updatedBy->name ?? 'System' }}: {{ ucfirst(strtolower($update->status)) }}@if ($update->note) ({{ $update->note }})@endif</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <div class="flex justify-end gap-2">
                        <button type="button" @click="statusTarget = null" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
        @endforeach
    @endunless

    @if ($isTenant)
        <div x-show="newOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" style="display:none">
            <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg" @click.outside="newOpen = false">
                <h2 class="mb-4 text-lg font-semibold text-gray-900">New Complaint</h2>

                @if ($errors->any())
                    <div class="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <ul class="list-inside list-disc">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form id="complaint-form" method="POST" action="{{ route('tenant.complaints.store') }}" enctype="multipart/form-data" class="grid grid-cols-2 gap-3">
                    @csrf
                    <div class="col-span-2">
                        <label class="mb-1 block text-sm font-medium text-gray-700">Title</label>
                        <input required name="title" value="{{ old('title') }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    </div>
                    <div class="col-span-2">
                        <label class="mb-1 block text-sm font-medium text-gray-700">Description</label>
                        <textarea required name="description" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">{{ old('description') }}</textarea>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Category</label>
                        <select name="category" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            @foreach (['ELECTRICITY', 'WATER', 'FACILITY', 'CLEANLINESS', 'SECURITY', 'OTHER'] as $c)
                                <option value="{{ $c }}" @selected(old('category') === $c)>{{ ucfirst(strtolower($c)) }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                        <select name="priority" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            @foreach (['LOW', 'MEDIUM', 'HIGH'] as $p)
                                <option value="{{ $p }}" @selected(old('priority') === $p)>{{ ucfirst(strtolower($p)) }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="mb-1 block text-sm font-medium text-gray-700">Photo (optional)</label>
                        <input type="file" name="image" accept="image/*" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    </div>
                </form>

                <div class="mt-4 flex justify-end gap-2">
                    <button type="button" @click="newOpen = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button form="complaint-form" type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Submit</button>
                </div>
            </div>
        </div>
    @endif
</div>

@endsection
