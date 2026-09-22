@extends('layouts.app')

@section('content')
<div class="space-y-4">
    <header>
        <h1 class="text-xl font-semibold text-gray-900">Activity Logs</h1>
        <p class="text-sm text-gray-500">Reverse-chronological audit trail of system actions.</p>
    </header>

    <x-panel title="Recent Activity">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-100 text-gray-500">
                        <th scope="col" class="py-2 pr-4">Timestamp</th>
                        <th scope="col" class="py-2 pr-4">User</th>
                        <th scope="col" class="py-2 pr-4">Action</th>
                        <th scope="col" class="py-2 pr-4">Entity</th>
                        <th scope="col" class="py-2 pr-4">Details</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($logs as $log)
                        <tr class="border-b border-gray-50">
                            <td class="py-2 pr-4 whitespace-nowrap"><time datetime="{{ optional($log->created_at)->format('Y-m-d\\TH:i') }}">{{ optional($log->created_at)->format('d M Y H:i') }}</time></td>
                            <td class="py-2 pr-4">{{ $log->user->name ?? 'System' }} @if ($log->user) <span class="text-xs text-gray-400">({{ ucfirst(strtolower($log->user->role)) }})</span> @endif</td>
                            <td class="py-2 pr-4">{{ $log->action }}</td>
                            <td class="py-2 pr-4">{{ $log->entity }}{{ $log->entity_id ? ' #' . $log->entity_id : '' }}</td>
                            <td class="py-2 pr-4 text-gray-500">{{ $log->details ?? '-' }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="py-6 text-center text-gray-400">No activity recorded yet.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $logs->links() }}</div>
    </x-panel>
</div>
@endsection
