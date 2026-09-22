<?php

namespace App\Http\Controllers;

use App\Exceptions\AppException;
use App\Http\Requests\CreatePaymentRequest;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    public function index(Request $request): View
    {
        $filters = $request->query();
        $isTenant = $request->user()->role === 'TENANT';

        if ($isTenant) {
            $filters['tenant_id'] = $request->attributes->get('tenant_id');
        }

        $payments = $this->paymentService->listPayments($filters);

        $payableBills = $isTenant
            ? $this->paymentService->getPayableBills($request->attributes->get('tenant_id'))
            : collect();

        return view('payments.index', [
            'payments' => $payments,
            'payableBills' => $payableBills,
        ]);
    }

    public function show(Request $request, Payment $payment): View
    {
        if ($request->user()->role === 'TENANT' && $payment->bill->rental->tenant_id !== $request->attributes->get('tenant_id')) {
            abort(403, 'You can only view your own payments.');
        }

        return view('payments.show', ['payment' => $payment->load(['bill.rental.tenant.user', 'bill.rental.room', 'verifiedBy'])]);
    }

    public function store(CreatePaymentRequest $request): RedirectResponse
    {
        $proofPath = $request->file('proof')->store('payments', 'public');

        try {
            $this->paymentService->createPayment(
                $request->validated(),
                '/storage/'.$proofPath,
                $request->attributes->get('tenant_id'),
                $request->user()->id
            );
        } catch (AppException $e) {
            Storage::disk('public')->delete($proofPath);

            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Payment proof submitted for verification.');
    }

    public function approve(Request $request, Payment $payment): RedirectResponse
    {
        if ($request->user()->role !== 'OWNER') {
            abort(403, 'Only the Owner can approve payments.');
        }

        try {
            $this->paymentService->approvePayment($payment->id, $request->user());
        } catch (AppException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Payment approved successfully.');
    }

    public function reject(Request $request, Payment $payment): RedirectResponse
    {
        if ($request->user()->role !== 'OWNER') {
            abort(403, 'Only the Owner can reject payments.');
        }

        try {
            $this->paymentService->rejectPayment($payment->id, $request->input('note'), $request->user());
        } catch (AppException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Payment rejected.');
    }
}
