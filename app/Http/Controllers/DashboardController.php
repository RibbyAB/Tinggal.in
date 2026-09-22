<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService,
        private readonly ReportService $reportService
    ) {}

    public function owner(): View
    {
        return view('owner.dashboard', [
            'data' => $this->dashboardService->getOwnerDashboard(),
            'revenue' => $this->reportService->getRevenueReport(6),
            'paymentStatus' => $this->reportService->getPaymentStatusReport(),
        ]);
    }

    public function admin(): View
    {
        return view('admin.dashboard', ['data' => $this->dashboardService->getAdminDashboard()]);
    }

    public function tenant(Request $request): View
    {
        return view('tenant.dashboard', ['data' => $this->dashboardService->getTenantDashboard($request->attributes->get('tenant_id'))]);
    }
}
