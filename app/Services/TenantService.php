<?php

namespace App\Services;

use App\Exceptions\AppException;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantService
{
    public function __construct(private readonly ActivityLogService $activityLog) {}

    public function listTenants(array $filters): LengthAwarePaginator
    {
        $query = Tenant::with([
            'user:id,name,email,phone,is_active',
            'rentals' => fn ($q) => $q->where('status', 'ACTIVE')->with('room'),
        ]);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        if (! empty($filters['rental_status'])) {
            $status = $filters['rental_status'];
            $query->whereHas('rentals', fn ($q) => $q->where('status', $status));
        }

        return $query->orderByDesc('created_at')
            ->paginate((int) ($filters['limit'] ?? 10), ['*'], 'page', (int) ($filters['page'] ?? 1))
            ->withQueryString();
    }

    public function getTenantById(int $id): Tenant
    {
        $tenant = Tenant::with([
            'user:id,name,email,phone,is_active',
            'rentals' => fn ($q) => $q->with('room', 'bills')->orderByDesc('created_at'),
            'complaints',
        ])->find($id);

        if (! $tenant) {
            throw new AppException('Tenant not found.', 404);
        }

        return $tenant;
    }

    public function createTenant(array $data, User $actingUser): Tenant
    {
        if (User::where('email', $data['email'])->exists()) {
            throw new AppException('A user with this email already exists.', 409);
        }

        return DB::transaction(function () use ($data, $actingUser) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'role' => 'TENANT',
            ]);

            $tenant = Tenant::create([
                'user_id' => $user->id,
                'ktp_number' => $data['ktp_number'] ?? null,
                'emergency_contact' => $data['emergency_contact'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            $this->activityLog->log(
                $actingUser->id,
                'TENANT_CREATED',
                'Tenant',
                $tenant->id,
                "Tenant {$user->name} ({$user->email}) created."
            );

            return $tenant->fresh('user');
        });
    }

    public function updateTenant(int $id, array $data, User $actingUser): Tenant
    {
        $tenant = Tenant::with('user')->find($id);
        if (! $tenant) {
            throw new AppException('Tenant not found.', 404);
        }

        return DB::transaction(function () use ($tenant, $data, $actingUser) {
            $tenant->user->update([
                'name' => $data['name'] ?? $tenant->user->name,
                'email' => $data['email'] ?? $tenant->user->email,
                'phone' => $data['phone'] ?? $tenant->user->phone,
            ]);

            $tenant->update([
                'ktp_number' => $data['ktp_number'] ?? $tenant->ktp_number,
                'emergency_contact' => $data['emergency_contact'] ?? $tenant->emergency_contact,
                'address' => $data['address'] ?? $tenant->address,
            ]);

            $this->activityLog->log($actingUser->id, 'TENANT_UPDATED', 'Tenant', $tenant->id);

            return $tenant->fresh('user');
        });
    }
}
