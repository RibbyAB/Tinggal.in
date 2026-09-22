<?php

namespace App\Http\Controllers;

use App\Exceptions\AppException;
use App\Http\Requests\GenerateBillRequest;
use App\Models\Bill;
use App\Services\BillService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class BillController extends Controller
{
    public function __construct(private readonly BillService $billService) {}

    public function index(Request $request): View
    {
        $filters = $request->query();
        if ($request->user()->role === 'TENANT') {
            $filters['tenant_id'] = $request->attributes->get('tenant_id');
        }

        $bills = $this->billService->listBills($filters);

        $billableRentals = $request->user()->role === 'TENANT'
            ? collect()
            : $this->billService->getBillableRentals();

        return view('bills.index', [
            'bills' => $bills,
            'billableRentals' => $billableRentals,
        ]);
    }

    public function show(Request $request, Bill $bill): View
    {
        $bill = $this->billService->getBillById($bill->id);

        if ($request->user()->role === 'TENANT' && $bill->rental->tenant_id !== $request->attributes->get('tenant_id')) {
            abort(403, 'You can only view your own bills.');
        }

        return view('bills.show', ['bill' => $bill]);
    }

    public function generate(GenerateBillRequest $request): RedirectResponse
    {
        try {
            $this->billService->generateBill($request->validated(), $request->user());
        } catch (AppException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Bill generated successfully.');
    }
}
