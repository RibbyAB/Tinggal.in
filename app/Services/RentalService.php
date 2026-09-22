<?php

namespace App\Services;

use App\Exceptions\AppException;
use App\Models\Rental;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class RentalService
{
    public function __construct(private readonly ActivityLogService $activityLog) {}

    public function listRentals(array $filters): LengthAwarePaginator
    {
        $query = Rental::with(['tenant.user', 'room']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['tenant_id'])) {
            $query->where('tenant_id', (int) $filters['tenant_id']);
        }
        if (! empty($filters['room_id'])) {
            $query->where('room_id', (int) $filters['room_id']);
        }

        return $query->orderByDesc('created_at')
            ->paginate((int) ($filters['limit'] ?? 10), ['*'], 'page', (int) ($filters['page'] ?? 1))
            ->withQueryString();
    }

    public function createRental(array $data, User $actingUser): Rental
    {
        $tenantId = (int) $data['tenant_id'];
        $roomId = (int) $data['room_id'];

        return DB::transaction(function () use ($tenantId, $roomId, $data, $actingUser) {
            $tenant = Tenant::find($tenantId);
            if (! $tenant) {
                throw new AppException('Tenant not found.', 404);
            }

            if (Rental::where('tenant_id', $tenantId)->where('status', 'ACTIVE')->exists()) {
                throw new AppException('This tenant already has an active rental.', 409);
            }

            $room = Room::where('id', $roomId)->lockForUpdate()->first();
            if (! $room) {
                throw new AppException('Room not found.', 404);
            }
            if ($room->status === 'MAINTENANCE') {
                throw new AppException('Room is under maintenance and cannot be assigned.', 409);
            }

            $activeOccupants = Rental::where('room_id', $roomId)->where('status', 'ACTIVE')->count();
            if ($activeOccupants >= $room->capacity) {
                throw new AppException('Room capacity has been reached.', 409);
            }

            $rental = Rental::create([
                'tenant_id' => $tenantId,
                'room_id' => $roomId,
                'monthly_price' => $room->price,
                'start_date' => $data['start_date'],
                'notes' => $data['notes'] ?? null,
                'status' => 'ACTIVE',
            ]);

            $occupantsAfter = $activeOccupants + 1;
            if ($occupantsAfter >= $room->capacity) {
                $room->update(['status' => 'OCCUPIED']);
            }

            $this->activityLog->log(
                $actingUser->id,
                'RENTAL_CREATED',
                'Rental',
                $rental->id,
                "Tenant #{$tenantId} checked into room {$room->room_number}."
            );

            return $rental;
        });
    }

    public function checkoutRental(int $rentalId, User $actingUser): Rental
    {
        return DB::transaction(function () use ($rentalId, $actingUser) {
            $rental = Rental::with('room')->find($rentalId);
            if (! $rental) {
                throw new AppException('Rental not found.', 404);
            }
            if ($rental->status !== 'ACTIVE') {
                throw new AppException('Only active rentals can be checked out.', 409);
            }

            $rental->update(['status' => 'COMPLETED', 'end_date' => now()]);

            $remainingActive = Rental::where('room_id', $rental->room_id)->where('status', 'ACTIVE')->count();
            if ($remainingActive === 0 && $rental->room->status !== 'MAINTENANCE') {
                $rental->room->update(['status' => 'AVAILABLE']);
            }

            $this->activityLog->log(
                $actingUser->id,
                'RENTAL_CHECKOUT',
                'Rental',
                $rental->id,
                "Rental #{$rental->id} checked out."
            );

            return $rental->fresh();
        });
    }

    public function getCheckInOptions(): array
    {
        return [
            'tenants' => Tenant::with('user')->get(),
            'rooms' => Room::where('status', 'AVAILABLE')->orderBy('room_number')->get(),
        ];
    }
}
