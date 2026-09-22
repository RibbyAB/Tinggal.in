<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Bill;
use App\Models\Complaint;
use App\Models\ComplaintUpdate;
use App\Models\Payment;
use App\Models\Rental;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    private const DEMO_PASSWORD = 'password123';

    public function run(): void
    {
        $this->command->info('Seeding database...');

        Schema::disableForeignKeyConstraints();
        ComplaintUpdate::query()->delete();
        Complaint::query()->delete();
        Payment::query()->delete();
        Bill::query()->delete();
        Rental::query()->delete();
        ActivityLog::query()->delete();
        Tenant::query()->delete();
        Room::query()->delete();
        User::query()->delete();
        Schema::enableForeignKeyConstraints();

        $passwordHash = Hash::make(self::DEMO_PASSWORD);

        $owner = User::create([
            'name' => 'Budi Santoso',
            'email' => 'owner@tinggal.in',
            'password' => $passwordHash,
            'phone' => '081234567890',
            'role' => 'OWNER',
        ]);

        $admin1 = User::create([
            'name' => 'Siti Rahayu',
            'email' => 'admin@tinggal.in',
            'password' => $passwordHash,
            'phone' => '081234567891',
            'role' => 'ADMIN',
        ]);

        User::create([
            'name' => 'Agus Wijaya',
            'email' => 'agus.admin@tinggal.in',
            'password' => $passwordHash,
            'phone' => '081234567892',
            'role' => 'ADMIN',
        ]);

        $roomTypes = ['STANDARD', 'DELUXE', 'VIP'];
        $roomPrices = ['STANDARD' => 1200000, 'DELUXE' => 1800000, 'VIP' => 2500000];
        $roomCounter = 1;

        for ($floor = 1; $floor <= 3; $floor++) {
            for ($i = 1; $i <= 6; $i++) {
                $type = $roomTypes[$roomCounter % 3];
                Room::create([
                    'room_number' => "{$floor}0{$i}",
                    'floor' => $floor,
                    'type' => $type,
                    'price' => $roomPrices[$type],
                    'capacity' => $type === 'VIP' ? 1 : 2,
                    'facilities' => match ($type) {
                        'VIP' => 'AC, Kamar Mandi Dalam, WiFi, TV, Lemari',
                        'DELUXE' => 'AC, Kamar Mandi Dalam, WiFi, Lemari',
                        default => 'Kipas Angin, WiFi, Lemari',
                    },
                    'description' => 'Kamar '.strtolower($type)." di lantai {$floor}",
                    'status' => 'AVAILABLE',
                ]);
                $roomCounter++;
            }
        }

        $rooms = Room::orderBy('room_number')->get();

        $tenantNames = [
            'Andi Pratama', 'Dewi Lestari', 'Rizky Ramadhan', 'Putri Ayu',
            'Fajar Nugroho', 'Indah Permata', 'Yusuf Firmansyah', 'Nadia Kusuma',
            'Bayu Setiawan', 'Maya Anggraini', 'Dimas Saputra', 'Rani Oktaviani',
        ];

        $tenants = [];
        foreach ($tenantNames as $i => $name) {
            $emailSlug = str_replace(' ', '.', strtolower($name));
            $user = User::create([
                'name' => $name,
                'email' => "{$emailSlug}@tinggal.in",
                'password' => $passwordHash,
                'phone' => '0813'.substr((string) (1000000 + $i), 0, 8),
                'role' => 'TENANT',
            ]);
            $tenants[] = Tenant::create([
                'user_id' => $user->id,
                'ktp_number' => '35710'.str_pad((string) (1000000 + $i), 10, '0', STR_PAD_LEFT),
                'emergency_contact' => '0812'.substr((string) (9000000 + $i), 0, 8),
                'address' => 'Jl. Contoh Alamat No. '.($i + 1).', Bandar Lampung',
            ]);
        }

        $demoTenantUser = User::create([
            'name' => 'Tenant Demo',
            'email' => 'tenant@tinggal.in',
            'password' => $passwordHash,
            'phone' => '081200000000',
            'role' => 'TENANT',
        ]);
        $demoTenant = Tenant::create([
            'user_id' => $demoTenantUser->id,
            'ktp_number' => '3571000000000001',
            'emergency_contact' => '081200000001',
            'address' => 'Jl. Demo Tenant No. 1, Bandar Lampung',
        ]);
        array_unshift($tenants, $demoTenant);

        $now = Carbon::now();
        $activeRentals = [];

        $demoRoom = $rooms[0];
        $demoRental = Rental::create([
            'tenant_id' => $demoTenant->id,
            'room_id' => $demoRoom->id,
            'monthly_price' => $demoRoom->price,
            'start_date' => $now->copy()->subMonthsNoOverflow(2)->startOfMonth(),
            'status' => 'ACTIVE',
        ]);
        $activeRentals[] = $demoRental;

        for ($i = 0; $i < 8; $i++) {
            $tenant = $tenants[$i + 1];
            $room = $rooms[$i + 1];
            $rental = Rental::create([
                'tenant_id' => $tenant->id,
                'room_id' => $room->id,
                'monthly_price' => $room->price,
                'start_date' => $now->copy()->subMonthsNoOverflow($i % 4)->startOfMonth(),
                'status' => 'ACTIVE',
            ]);
            $activeRentals[] = $rental;
        }

        for ($i = 9; $i < 12; $i++) {
            $tenant = $tenants[$i];
            $room = $rooms[$i + 1];
            Rental::create([
                'tenant_id' => $tenant->id,
                'room_id' => $room->id,
                'monthly_price' => $room->price,
                'start_date' => $now->copy()->subMonthsNoOverflow(6)->startOfMonth(),
                'end_date' => $now->copy()->subMonthsNoOverflow(3)->startOfMonth(),
                'status' => 'COMPLETED',
            ]);
        }

        $spareTenants = [$tenants[9], $tenants[10], $tenants[11], $tenants[12]];
        foreach ($activeRentals as $rental) {
            if ($spareTenants === []) {
                break;
            }

            $room = $rental->room;
            $occupants = Rental::where('room_id', $room->id)->where('status', 'ACTIVE')->count();

            if ($occupants < $room->capacity) {
                $roommate = array_shift($spareTenants);
                $activeRentals[] = Rental::create([
                    'tenant_id' => $roommate->id,
                    'room_id' => $room->id,
                    'monthly_price' => $room->price,
                    'start_date' => $now->copy()->subMonthsNoOverflow(1)->startOfMonth(),
                    'status' => 'ACTIVE',
                ]);
            }
        }

        foreach ($rooms as $room) {
            $occupants = Rental::where('room_id', $room->id)->where('status', 'ACTIVE')->count();
            $room->update(['status' => $occupants >= $room->capacity ? 'OCCUPIED' : 'AVAILABLE']);
        }

        $rooms->last()->update(['status' => 'MAINTENANCE']);

        foreach ($activeRentals as $rental) {
            for ($m = 2; $m >= 0; $m--) {
                $billDate = $now->copy()->subMonthsNoOverflow($m)->startOfMonth();
                $dueDate = $now->copy()->subMonthsNoOverflow($m)->startOfMonth()->addDays(9);

                if ($billDate->lt($rental->start_date->copy()->startOfMonth())) {
                    continue;
                }

                $bill = Bill::create([
                    'rental_id' => $rental->id,
                    'bill_month' => $billDate->month,
                    'bill_year' => $billDate->year,
                    'amount' => $rental->monthly_price,
                    'due_date' => $dueDate,
                    'status' => 'UNPAID',
                ]);

                if ($m === 2) {
                    Payment::create([
                        'bill_id' => $bill->id,
                        'amount' => $bill->amount,
                        'method' => 'BANK_TRANSFER',
                        'proof_file_path' => '/storage/payments/sample-proof.png',
                        'status' => 'APPROVED',
                        'paid_at' => $dueDate->copy()->subDays(2),
                        'verified_by_id' => $owner->id,
                        'verified_at' => $dueDate,
                    ]);
                    $bill->update(['status' => 'PAID']);
                } elseif ($m === 1) {
                    Payment::create([
                        'bill_id' => $bill->id,
                        'amount' => $bill->amount,
                        'method' => 'E_WALLET',
                        'proof_file_path' => '/storage/payments/sample-proof.png',
                        'status' => 'PENDING',
                        'paid_at' => $dueDate->copy()->subDays(1),
                    ]);
                    $bill->update(['status' => 'PENDING_VERIFICATION']);
                } elseif ($rental->id % 3 === 0) {
                    $verifiedAt = $now->copy()->subDays(3)->max($now->copy()->startOfMonth());

                    Payment::create([
                        'bill_id' => $bill->id,
                        'amount' => $bill->amount,
                        'method' => 'CASH',
                        'proof_file_path' => '/storage/payments/sample-proof.png',
                        'status' => 'APPROVED',
                        'paid_at' => $verifiedAt->copy()->subDay(),
                        'verified_by_id' => $owner->id,
                        'verified_at' => $verifiedAt,
                    ]);
                    $bill->update(['status' => 'PAID']);
                } else {
                    $bill->update(['status' => $dueDate->isPast() ? 'OVERDUE' : 'UNPAID']);
                }
            }
        }

        $complaintSeeds = [
            ['title' => 'AC tidak dingin', 'category' => 'FACILITY', 'priority' => 'MEDIUM', 'status' => 'OPEN'],
            ['title' => 'Lampu kamar mati', 'category' => 'ELECTRICITY', 'priority' => 'HIGH', 'status' => 'IN_PROGRESS'],
            ['title' => 'Air kamar mandi kecil', 'category' => 'WATER', 'priority' => 'MEDIUM', 'status' => 'RESOLVED'],
            ['title' => 'Area parkir kurang bersih', 'category' => 'CLEANLINESS', 'priority' => 'LOW', 'status' => 'OPEN'],
            ['title' => 'Pintu gerbang rusak', 'category' => 'SECURITY', 'priority' => 'HIGH', 'status' => 'CLOSED'],
        ];

        foreach ($complaintSeeds as $i => $seed) {
            $rental = $activeRentals[$i % count($activeRentals)];
            $complaint = Complaint::create([
                'tenant_id' => $rental->tenant_id,
                'title' => $seed['title'],
                'description' => "{$seed['title']} - mohon segera ditindaklanjuti.",
                'category' => $seed['category'],
                'priority' => $seed['priority'],
                'status' => $seed['status'],
            ]);

            if ($seed['status'] !== 'OPEN') {
                ComplaintUpdate::create([
                    'complaint_id' => $complaint->id,
                    'updated_by_id' => $admin1->id,
                    'status' => $seed['status'],
                    'note' => 'Sedang/telah ditangani oleh admin.',
                ]);
            }
        }

        ActivityLog::insert([
            [
                'user_id' => $owner->id,
                'action' => 'SYSTEM_SEEDED',
                'entity' => 'System',
                'entity_id' => null,
                'details' => 'Database seeded with demo data.',
                'created_at' => $now,
            ],
            [
                'user_id' => $owner->id,
                'action' => 'PAYMENT_APPROVED',
                'entity' => 'Payment',
                'entity_id' => null,
                'details' => 'Demo seed activity.',
                'created_at' => $now,
            ],
        ]);

        $this->command->info('Seed complete.');
        $this->command->info('Demo accounts (password for all: '.self::DEMO_PASSWORD.'):');
        $this->command->info('  Owner:  owner@tinggal.in');
        $this->command->info('  Admin:  admin@tinggal.in');
        $this->command->info('  Tenant: tenant@tinggal.in');
    }
}
