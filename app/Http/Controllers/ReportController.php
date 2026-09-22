<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ReportController extends Controller
{
    private const REVENUE_MONTHS = 12;

    public function __construct(private readonly ReportService $reportService) {}

    public function index(Request $request): View
    {
        $requested = (int) $request->query('months', self::REVENUE_MONTHS);
        $months = max(1, min($requested ?: self::REVENUE_MONTHS, 24));

        return view('reports.index', [
            'revenue' => $this->reportService->getRevenueReport($months),
            'occupancy' => $this->reportService->getOccupancyReport(),
            'paymentStatus' => $this->reportService->getPaymentStatusReport(),
            'months' => $months,
        ]);
    }
}
