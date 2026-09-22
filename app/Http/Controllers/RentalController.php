<?php

namespace App\Http\Controllers;

use App\Exceptions\AppException;
use App\Http\Requests\RentalRequest;
use App\Models\Rental;
use App\Services\RentalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class RentalController extends Controller
{
    public function __construct(private readonly RentalService $rentalService) {}

    public function index(Request $request): View
    {
        $filters = $request->query();
        if ($request->user()->role === 'TENANT') {
            $filters['tenant_id'] = $request->attributes->get('tenant_id');
        }

        $rentals = $this->rentalService->listRentals($filters);
        $options = $this->rentalService->getCheckInOptions();

        return view('rentals.index', [
            'rentals' => $rentals,
            'availableTenants' => $options['tenants'],
            'availableRooms' => $options['rooms'],
        ]);
    }

    public function store(RentalRequest $request): RedirectResponse
    {
        try {
            $this->rentalService->createRental($request->validated(), $request->user());
        } catch (AppException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Tenant checked in successfully.');
    }

    public function checkout(Request $request, Rental $rental): RedirectResponse
    {
        try {
            $this->rentalService->checkoutRental($rental->id, $request->user());
        } catch (AppException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Tenant checked out successfully.');
    }
}
