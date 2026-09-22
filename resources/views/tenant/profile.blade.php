@extends('layouts.app')

@section('content')
<div class="space-y-4">
    <div>
        <h1 class="text-xl font-semibold text-gray-900">My Profile</h1>
        <p class="text-sm text-gray-500">View and update your personal information.</p>
    </div>

    <x-panel title="Profile">
        @if ($errors->any())
            <div class="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <ul class="list-inside list-disc">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('tenant.profile.update') }}" class="grid grid-cols-2 gap-3">
            @csrf
            @method('PUT')
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input name="name" value="{{ old('name', $tenant->user->name) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                @error('name') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value="{{ old('email', $tenant->user->email) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                @error('email') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input name="phone" value="{{ old('phone', $tenant->user->phone) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                @error('phone') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">KTP Number</label>
                <input name="ktp_number" value="{{ old('ktp_number', $tenant->ktp_number) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Emergency Contact</label>
                <input name="emergency_contact" value="{{ old('emergency_contact', $tenant->emergency_contact) }}" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            </div>
            <div class="col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">{{ old('address', $tenant->address) }}</textarea>
            </div>
            <div class="col-span-2">
                <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Save Changes</button>
            </div>
        </form>
    </x-panel>

    <x-panel title="Current Rental">
        @php $activeRental = $tenant->rentals->firstWhere('status', 'ACTIVE'); @endphp
        @if ($activeRental)
            <dl class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <dt class="text-gray-500">Room</dt>
                    <dd class="font-medium text-gray-900">{{ $activeRental->room->room_number ?? '-' }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Monthly Price</dt>
                    <dd class="font-medium text-gray-900">Rp {{ number_format($activeRental->monthly_price, 0, ',', '.') }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Start Date</dt>
                    <dd class="font-medium text-gray-900">{{ optional($activeRental->start_date)->format('d M Y') }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Status</dt>
                    <dd><x-status-badge :status="$activeRental->status" /></dd>
                </div>
            </dl>
        @else
            <p class="text-sm text-gray-400">No active rental.</p>
        @endif
    </x-panel>
</div>
@endsection
