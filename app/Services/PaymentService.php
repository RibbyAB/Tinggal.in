<?php

namespace App\Services;

use App\Exceptions\AppException;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(private readonly ActivityLogService $activityLog) {}

    public function listPayments(array $filters): LengthAwarePaginator
    {
        $query = Payment::with(['bill.rental.tenant.user', 'bill.rental.room', 'verifiedBy']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['month'])) {
            $month = (int) $filters['month'];
            $query->whereHas('bill', fn ($q) => $q->where('bill_month', $month));
        }
        if (! empty($filters['tenant_id'])) {
            $tenantId = (int) $filters['tenant_id'];
            $query->whereHas('bill.rental', fn ($q) => $q->where('tenant_id', $tenantId));
        }

        return $query->orderByDesc('created_at')
            ->paginate((int) ($filters['limit'] ?? 10), ['*'], 'page', (int) ($filters['page'] ?? 1))
            ->withQueryString();
    }

    public function createPayment(array $data, string $proofFilePath, int $tenantId, int $actingUserId): Payment
    {
        $bill = Bill::with('rental')->find((int) $data['bill_id']);
        if (! $bill) {
            throw new AppException('Bill not found.', 404);
        }

        if ($bill->rental->tenant_id !== $tenantId) {
            throw new AppException('You can only pay your own bills.', 403);
        }
        if ($bill->status === 'PAID') {
            throw new AppException('This bill has already been paid.', 409);
        }

        return DB::transaction(function () use ($bill, $data, $proofFilePath, $actingUserId) {
            $alreadyWaiting = Payment::where('bill_id', $bill->id)->where('status', 'PENDING')->lockForUpdate()->count();
            if ($alreadyWaiting > 0) {
                throw new AppException('A payment for this bill is already waiting for verification.', 409);
            }

            $payment = Payment::create([
                'bill_id' => $bill->id,
                'amount' => $data['amount'],
                'method' => $data['method'] ?? 'BANK_TRANSFER',
                'proof_file_path' => $proofFilePath,
                'status' => 'PENDING',
                'paid_at' => now(),
            ]);

            $bill->update(['status' => 'PENDING_VERIFICATION']);

            $this->activityLog->log($actingUserId, 'PAYMENT_SUBMITTED', 'Payment', $payment->id, "Payment submitted for bill #{$bill->id}.");

            return $payment;
        });
    }

    public function approvePayment(int $paymentId, User $actingUser): Payment
    {
        return DB::transaction(function () use ($paymentId, $actingUser) {
            $payment = Payment::with('bill')->lockForUpdate()->find($paymentId);
            if (! $payment) {
                throw new AppException('Payment not found.', 404);
            }
            if ($payment->status !== 'PENDING') {
                throw new AppException('Payment has already been '.Str::lower($payment->status).'.', 409);
            }

            $payment->update([
                'status' => 'APPROVED',
                'verified_by_id' => $actingUser->id,
                'verified_at' => now(),
            ]);

            $payment->bill->update(['status' => 'PAID']);

            $this->activityLog->log(
                $actingUser->id,
                'PAYMENT_APPROVED',
                'Payment',
                $payment->id,
                "Payment #{$payment->id} approved; bill #{$payment->bill_id} marked PAID."
            );

            return $payment->fresh();
        });
    }

    private function resolveBillStatus(Payment $rejectedPayment): string
    {
        $approved = Payment::where('bill_id', $rejectedPayment->bill_id)->where('status', 'APPROVED')->exists();
        if ($approved) {
            return 'PAID';
        }

        $stillWaiting = Payment::where('bill_id', $rejectedPayment->bill_id)
            ->where('status', 'PENDING')
            ->where('id', '!=', $rejectedPayment->id)
            ->exists();
        if ($stillWaiting) {
            return 'PENDING_VERIFICATION';
        }

        return $rejectedPayment->bill->due_date->isPast() ? 'OVERDUE' : 'UNPAID';
    }

    public function rejectPayment(int $paymentId, ?string $note, User $actingUser): Payment
    {
        return DB::transaction(function () use ($paymentId, $note, $actingUser) {
            $payment = Payment::with('bill')->lockForUpdate()->find($paymentId);
            if (! $payment) {
                throw new AppException('Payment not found.', 404);
            }
            if ($payment->status !== 'PENDING') {
                throw new AppException('Payment has already been '.Str::lower($payment->status).'.', 409);
            }

            $payment->update([
                'status' => 'REJECTED',
                'verified_by_id' => $actingUser->id,
                'verified_at' => now(),
                'rejection_note' => $note ?: null,
            ]);

            $payment->bill->update(['status' => $this->resolveBillStatus($payment)]);

            $this->activityLog->log(
                $actingUser->id,
                'PAYMENT_REJECTED',
                'Payment',
                $payment->id,
                $note ? "Rejected: {$note}" : 'Rejected.'
            );

            return $payment->fresh();
        });
    }

    public function getPayableBills(int $tenantId): Collection
    {
        return Bill::with('rental.room')
            ->whereIn('status', ['UNPAID', 'OVERDUE'])
            ->whereHas('rental', fn ($q) => $q->where('tenant_id', $tenantId))
            ->orderBy('due_date')
            ->get();
    }
}
