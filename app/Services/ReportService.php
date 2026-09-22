<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Room;
use Carbon\Carbon;

class ReportService
{
    public function getRevenueReport(int $months = 6): array
    {
        $since = Carbon::now()->subMonthsNoOverflow($months - 1)->startOfMonth();

        $payments = Payment::where('status', 'APPROVED')
            ->where('verified_at', '>=', $since)
            ->get(['amount', 'verified_at']);

        $buckets = [];
        for ($i = 0; $i < $months; $i++) {
            $d = $since->copy()->addMonthsNoOverflow($i);
            $buckets[$d->format('Y-m')] = 0;
        }

        foreach ($payments as $payment) {
            $key = $payment->verified_at->format('Y-m');
            if (array_key_exists($key, $buckets)) {
                $buckets[$key] += (float) $payment->amount;
            }
        }

        $result = [];
        foreach ($buckets as $month => $revenue) {
            $result[] = ['month' => $month, 'revenue' => $revenue];
        }

        return $result;
    }

    public function getOccupancyReport(): array
    {
        $total = Room::count();
        $occupied = Room::where('status', 'OCCUPIED')->count();
        $available = Room::where('status', 'AVAILABLE')->count();
        $maintenance = Room::where('status', 'MAINTENANCE')->count();

        $occupancyRate = $total > 0 ? round(($occupied / $total) * 100, 1) : 0;

        return compact('total', 'occupied', 'available', 'maintenance', 'occupancyRate');
    }

    public function getPaymentStatusReport(): array
    {
        $statuses = ['PENDING', 'APPROVED', 'REJECTED'];

        return array_map(
            fn ($status) => ['status' => $status, 'count' => Payment::where('status', $status)->count()],
            $statuses
        );
    }
}
