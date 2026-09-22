<?php

namespace App\Services;

use App\Exceptions\AppException;
use App\Models\Rental;
use App\Models\Room;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class RoomService
{
    private const MANUAL_STATUSES = ['AVAILABLE', 'MAINTENANCE'];

    public function __construct(private readonly ActivityLogService $activityLog) {}

    public function listRooms(array $filters): LengthAwarePaginator
    {
        $query = Room::query();

        if (! empty($filters['search'])) {
            $query->where('room_number', 'like', '%'.$filters['search'].'%');
        }
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (! empty($filters['floor'])) {
            $query->where('floor', (int) $filters['floor']);
        }

        return $query->orderBy('room_number')
            ->paginate((int) ($filters['limit'] ?? 10), ['*'], 'page', (int) ($filters['page'] ?? 1))
            ->withQueryString();
    }

    public function getRoomById(int $id): Room
    {
        $room = Room::with(['rentals' => function ($q) {
            $q->where('status', 'ACTIVE')->with('tenant.user');
        }])->find($id);

        if (! $room) {
            throw new AppException('Room not found.', 404);
        }

        return $room;
    }

    public function createRoom(array $data, User $actingUser): Room
    {
        if (Room::where('room_number', $data['room_number'])->exists()) {
            throw new AppException('A room with this number already exists.', 409);
        }

        return DB::transaction(function () use ($data, $actingUser) {
            $room = Room::create([
                'room_number' => $data['room_number'],
                'floor' => (int) $data['floor'],
                'type' => $data['type'] ?? 'STANDARD',
                'price' => $data['price'],
                'capacity' => isset($data['capacity']) ? (int) $data['capacity'] : 1,
                'facilities' => $data['facilities'] ?? null,
                'description' => $data['description'] ?? null,
                'status' => 'AVAILABLE',
            ]);

            $this->activityLog->log($actingUser->id, 'ROOM_CREATED', 'Room', $room->id, "Room {$room->room_number} created.");

            return $room;
        });
    }

    public function updateRoom(int $id, array $data, User $actingUser): Room
    {
        $room = Room::find($id);
        if (! $room) {
            throw new AppException('Room not found.', 404);
        }

        return DB::transaction(function () use ($room, $data, $actingUser) {
            $room->update([
                'room_number' => $data['room_number'] ?? $room->room_number,
                'floor' => isset($data['floor']) ? (int) $data['floor'] : $room->floor,
                'type' => $data['type'] ?? $room->type,
                'price' => $data['price'] ?? $room->price,
                'capacity' => isset($data['capacity']) ? (int) $data['capacity'] : $room->capacity,
                'facilities' => $data['facilities'] ?? $room->facilities,
                'description' => $data['description'] ?? $room->description,
            ]);

            $this->activityLog->log($actingUser->id, 'ROOM_UPDATED', 'Room', $room->id, "Room {$room->room_number} updated.");

            return $room->fresh();
        });
    }

    public function updateRoomStatus(int $id, string $status, User $actingUser): Room
    {
        $room = Room::find($id);
        if (! $room) {
            throw new AppException('Room not found.', 404);
        }

        if (! in_array($status, self::MANUAL_STATUSES, true)) {
            throw new AppException(
                'Room status can only be set to AVAILABLE or MAINTENANCE. OCCUPIED is set automatically at check-in.',
                422
            );
        }

        $hasActiveRental = Rental::where('room_id', $id)->where('status', 'ACTIVE')->exists();
        if ($hasActiveRental) {
            throw new AppException(
                'This room still has an active tenant. Check the tenant out before changing the room status.',
                409
            );
        }

        if ($room->status === $status) {
            return $room;
        }

        return DB::transaction(function () use ($room, $status, $actingUser) {
            $room->update(['status' => $status]);

            $this->activityLog->log($actingUser->id, 'ROOM_STATUS_CHANGED', 'Room', $room->id, "Status changed to {$status}.");

            return $room->fresh();
        });
    }
}
