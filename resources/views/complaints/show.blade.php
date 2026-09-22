@extends('layouts.app')

@php
    $prefix = strtolower(auth()->user()->role);
@endphp

@section('content')
<div class="space-y-4">
    <div>
        <h1 class="text-xl font-semibold text-gray-900">{{ $complaint->title }}</h1>
        <p class="text-sm text-gray-500">Submitted by {{ $complaint->tenant->user->name ?? '-' }}</p>
    </div>

    <x-panel title="Complaint Details">
        <dl class="grid grid-cols-2 gap-4 text-sm">
            <div>
                <dt class="text-gray-500">Category</dt>
                <dd class="font-medium text-gray-900">{{ ucfirst(strtolower($complaint->category ?? 'other')) }}</dd>
            </div>
            <div>
                <dt class="text-gray-500">Priority</dt>
                <dd class="font-medium text-gray-900">{{ ucfirst(strtolower($complaint->priority ?? 'low')) }}</dd>
            </div>
            <div>
                <dt class="text-gray-500">Status</dt>
                <dd><x-status-badge :status="$complaint->status" /></dd>
            </div>
            <div class="col-span-2">
                <dt class="text-gray-500">Description</dt>
                <dd class="font-medium text-gray-900">{{ $complaint->description }}</dd>
            </div>
            @if ($complaint->image_path)
                <div class="col-span-2">
                    <dt class="text-gray-500">Photo</dt>
                    <dd><a href="{{ $complaint->image_path }}" target="_blank" class="text-primary-600 hover:underline">View Image</a></dd>
                </div>
            @endif
        </dl>
    </x-panel>

    <x-panel title="Update History">
        <ul class="space-y-2 text-sm">
            @forelse ($complaint->updates as $update)
                <li class="border-b border-gray-50 pb-2">
                    <span class="font-medium text-gray-900">{{ ucfirst(strtolower(str_replace('_', ' ', $update->status))) }}</span>
                    <span class="text-gray-500"> by {{ $update->updatedBy->name ?? 'System' }} on {{ optional($update->created_at)->format('d M Y H:i') }}</span>
                    @if ($update->note)
                        <p class="text-gray-600">{{ $update->note }}</p>
                    @endif
                </li>
            @empty
                <li class="text-gray-400">No status updates yet.</li>
            @endforelse
        </ul>
    </x-panel>

    <a href="{{ route($prefix . '.complaints.index') }}" class="text-sm text-primary-600 hover:underline">&larr; Back to Complaints</a>
</div>
@endsection
