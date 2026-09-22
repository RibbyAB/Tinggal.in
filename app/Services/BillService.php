<?php

namespace App\Services;

use App\Exceptions\AppException;
use App\Models\Bill;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BillService
{
    public function __construct(private readonly ActivityLogService $activityLog) {}

    public function listBills(array $filters): LengthAwarePaginator
    {
        $query = Bill::with(['rental.tenant.user', 'rental.room', 'payments']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['month'])) {
            $query->where('bill_month', (int) $filters['month']);
        }
        if (! empty($filters['tenant_id'])) {
            $tenantId = (int) $filters['tenant_id'];
            $query->whereHas('rental', fn ($q) => $q->where('tenant_id', $tenantId));
        }

        return $query->orderByDesc('bill_year')->orderByDesc('bill_month')
            ->paginate((int) ($filters['limit'] ?? 10), ['*'], 'page', (int) ($filters['page'] ?? 1))
            ->withQueryString();
    }

    public function getBillById(int $id): Bill
    {
        $bill = Bill::with(['rental.tenant.user', 'rental.room', 'payments'])->find($id);
        if (! $bill) {
            throw new AppException('Bill not found.', 404);
        }

        return $bill;
    }

    public function generateBill(array $data, User $actingUser): Bill
    {
        $rentalId = (int) $data['rental_id'];
        $billMonth = (int) $data['bill_month'];
        $billYear = (int) $data['bill_year'];

        $rental = Rental::find($rentalId);
        if (! $rental) {
            throw new AppException('Rental not found.', 404);
        }
        if ($rental->status !== 'ACTIVE') {
            throw new AppException('Cannot generate a bill for a rental that is not active.', 409);
        }

        $existing = Bill::where('rental_id', $rentalId)
            ->where('bill_month', $billMonth)
            ->where('bill_year', $billYear)
            ->exists();
        if ($existing) {
            throw new AppException('A bill for this rental and month already exists.', 409);
        }

        return DB::transaction(function () use ($rental, $rentalId, $billMonth, $billYear, $data, $actingUser) {
            $bill = Bill::create([
                'rental_id' => $rentalId,
                'bill_month' => $billMonth,
                'bill_year' => $billYear,
                'amount' => $rental->monthly_price,
                'due_date' => $data['due_date'],
                'status' => 'UNPAID',
            ]);

            $this->activityLog->log(
                $actingUser->id,
                'BILL_GENERATED',
                'Bill',
                $bill->id,
                "Bill for {$billMonth}/{$billYear} generated for rental #{$rentalId}."
            );

            return $bill;
        });
    }

    public function getBillableRentals(): Collection
    {
        return Rental::with(['tenant.user', 'room'])
            ->where('status', 'ACTIVE')
            ->get();
    }
}
