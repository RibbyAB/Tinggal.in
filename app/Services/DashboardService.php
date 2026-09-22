<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\Complaint;
use App\Models\Payment;
use App\Models\ActivityLog;
use App\Models\Rental;
use App\Models\Room;
use App\Models\Tenant;
use Carbon\Carbon;

class DashboardService
{
    public function __construct(private readonly ReportService $reportService) {}

    public function getOwnerDashboard(): array
    {
        $occupancy = $this->reportService->getOccupancyReport();

        $totalTenants = Tenant::count();
        $outstandingBills = Bill::whereIn('status', ['UNPAID', 'OVERDUE', 'PENDING_VERIFICATION'])->count();
        $activeComplaints = Complaint::whereIn('status', ['OPEN', 'IN_PROGRESS'])->count();
        $monthlyRevenue = (float) Payment::where('status', 'APPROVED')
            ->where('verified_at', '>=', Carbon::now()->startOfMonth())
            ->sum('amount');

        return array_merge($occupancy, [
            'totalTenants' => $totalTenants,
            'monthlyRevenue' => $monthlyRevenue,
            'outstandingBills' => $outstandingBills,
            'activeComplaints' => $activeComplaints,
        ]);
    }

    public function getAdminDashboard(): array
    {
        return [
            'totalTenants' => Tenant::count(),
            'availableRooms' => Room::where('status', 'AVAILABLE')->count(),
            'pendingPayments' => Payment::where('status', 'PENDING')->count(),
            'activeComplaints' => Complaint::whereIn('status', ['OPEN', 'IN_PROGRESS'])->count(),
            'recentActivity' => ActivityLog::with('user:id,name,role')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
        ];
    }

    public function getTenantDashboard(int $tenantId): array
    {
        $activeRental = Rental::where('tenant_id', $tenantId)->where('status', 'ACTIVE')->with('room')->first();

        $currentBill = null;
        if ($activeRental) {
            $currentBill = Bill::where('rental_id', $activeRental->id)
                ->orderByDesc('bill_year')->orderByDesc('bill_month')
                ->first();
        }

        $recentPayments = Payment::whereHas('bill.rental', fn ($q) => $q->where('tenant_id', $tenantId))
            ->orderByDesc('created_at')->limit(5)->get();

        $complaints = Complaint::where('tenant_id', $tenantId)->orderByDesc('created_at')->limit(5)->get();

        return [
            'rental' => $activeRental,
            'currentBill' => $currentBill,
            'recentPayments' => $recentPayments,
            'complaints' => $complaints,
        ];
    }
}
