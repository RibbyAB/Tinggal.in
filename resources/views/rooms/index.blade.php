@extends('layouts.app')

@php
    $prefix = strtolower(auth()->user()->role);
@endphp

@section('content')
<div class="space-y-4" x-data="{
        modalOpen: {{ $errors->any() ? 'true' : 'false' }},
        editingId: {{ old('_editing_id') ? (int) old('_editing_id') : 'null' }},
        form: {
            room_number: {{ Js::from(old('room_number', '')) }},
            floor: {{ Js::from(old('floor', '')) }},
            type: {{ Js::from(old('type', 'STANDARD')) }},
            price: {{ Js::from(old('price', '')) }},
            capacity: {{ Js::from(old('capacity', 1)) }},
            facilities: {{ Js::from(old('facilities', '')) }},
            description: {{ Js::from(old('description', '')) }}
        }
     }">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-xl font-semibold text-gray-900">Rooms</h1>
            <p class="text-sm text-gray-500">Manage room inventory, pricing, and availability.</p>
        </div>
        <button type="button" @click="editingId = null; form = { room_number: '', floor: '', type: 'STANDARD', price: '', capacity: 1, facilities: '', description: '' }; modalOpen = true"
            class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            + Add Room
        </button>
    </div>

    <x-panel title="Filters">
        <form method="GET" action="{{ route($prefix . '.rooms.index') }}" class="flex flex-wrap items-end gap-3">
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Search</label>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search room number..."
                    class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select name="status" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">All Status</option>
                    @foreach (['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] as $s)
                        <option value="{{ $s }}" @selected(request('status') === $s)>{{ ucfirst(strtolower($s)) }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select name="type" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">All Types</option>
                    @foreach (['STANDARD', 'DELUXE', 'VIP'] as $t)
                        <option value="{{ $t }}" @selected(request('type') === $t)>{{ ucfirst(strtolower($t)) }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Floor</label>
                <input type="number" name="floor" value="{{ request('floor') }}" class="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm">
            </div>
            <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Apply</button>
            <a href="{{ route($prefix . '.rooms.index') }}" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Reset</a>
        </form>
    </x-panel>

    <x-panel title="Room List">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-100 text-gray-500">
                        <th class="py-2 pr-4">Room</th>
                        <th class="py-2 pr-4">Floor</th>
                        <th class="py-2 pr-4">Type</th>
                        <th class="py-2 pr-4">Price</th>
                        <th class="py-2 pr-4">Capacity</th>
                        <th class="py-2 pr-4">Status</th>
                        <th class="py-2 pr-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($rooms as $room)
                        <tr class="border-b border-gray-50">
                            <td class="py-2 pr-4 font-medium text-gray-900">{{ $room->room_number }}</td>
                            <td class="py-2 pr-4">{{ $room->floor }}</td>
                            <td class="py-2 pr-4">{{ ucfirst(strtolower($room->type)) }}</td>
                            <td class="py-2 pr-4">Rp {{ number_format($room->price, 0, ',', '.') }}</td>
                            <td class="py-2 pr-4">{{ $room->capacity }}</td>
                            <td class="py-2 pr-4"><x-status-badge :status="$room->status" /></td>
                            <td class="py-2 pr-4">
                                <div class="flex gap-2">
                                    <button type="button" class="text-primary-600 hover:underline"
                                        @click="editingId = {{ $room->id }}; form = { room_number: {{ Js::from($room->room_number) }}, floor: {{ Js::from((string) $room->floor) }}, type: {{ Js::from($room->type) }}, price: {{ Js::from((string) $room->price) }}, capacity: {{ Js::from((string) $room->capacity) }}, facilities: {{ Js::from($room->facilities ?? '') }}, description: {{ Js::from($room->description ?? '') }} }; modalOpen = true">
                                        Edit
                                    </button>
                                    @if ($room->status === 'AVAILABLE')
                                        <form method="POST" action="{{ route($prefix . '.rooms.status', $room) }}" class="inline">
                                            @csrf
                                            @method('PATCH')
                                            <input type="hidden" name="status" value="MAINTENANCE">
                                            <button type="submit" class="text-amber-600 hover:underline">Maintenance</button>
                                        </form>
                                    @elseif ($room->status === 'MAINTENANCE')
                                        <form method="POST" action="{{ route($prefix . '.rooms.status', $room) }}" class="inline">
                                            @csrf
                                            @method('PATCH')
                                            <input type="hidden" name="status" value="AVAILABLE">
                                            <button type="submit" class="text-primary-600 hover:underline">Set Available</button>
                                        </form>
                                    @else
                                        <span class="text-gray-400">Dihuni</span>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-6 text-center text-gray-400">No rooms found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $rooms->links() }}</div>
    </x-panel>

    <div x-show="modalOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" style="display:none">
        <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg" @click.outside="modalOpen = false">
            <h2 class="mb-4 text-lg font-semibold text-gray-900" x-text="editingId ? 'Edit Room' : 'Add Room'"></h2>

            @if ($errors->any())
                <div class="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <ul class="list-inside list-disc">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form id="room-form" method="POST" :action="editingId ? '{{ url($prefix . '/rooms') }}/' + editingId : '{{ route($prefix . '.rooms.store') }}'" class="grid grid-cols-2 gap-3">
                @csrf
                <template x-if="editingId">
                    <span>
                        <input type="hidden" name="_method" value="PUT">
                        <input type="hidden" name="_editing_id" :value="editingId">
                    </span>
                </template>

                <div class="col-span-2">
                    <label class="mb-1 block text-sm font-medium text-gray-700">Room Number</label>
                    <input required name="room_number" x-model="form.room_number" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">Floor</label>
                    <input required type="number" name="floor" x-model="form.floor" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">Type</label>
                    <select name="type" x-model="form.type" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="STANDARD">Standard</option>
                        <option value="DELUXE">Deluxe</option>
                        <option value="VIP">VIP</option>
                    </select>
                </div>
                <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">Price</label>
                    <input required type="number" step="0.01" name="price" x-model="form.price" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">Capacity</label>
                    <input type="number" name="capacity" x-model="form.capacity" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                </div>
                <div class="col-span-2">
                    <label class="mb-1 block text-sm font-medium text-gray-700">Facilities</label>
                    <input name="facilities" x-model="form.facilities" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                </div>
                <div class="col-span-2">
                    <label class="mb-1 block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" x-model="form.description" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"></textarea>
                </div>
            </form>

            <div class="mt-4 flex justify-end gap-2">
                <button type="button" @click="modalOpen = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button form="room-form" type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Save</button>
            </div>
        </div>
    </div>
</div>

@endsection
