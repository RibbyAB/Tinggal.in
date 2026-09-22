<?php

namespace App\Http\Controllers;

use App\Exceptions\AppException;
use App\Http\Requests\ComplaintRequest;
use App\Http\Requests\UpdateComplaintStatusRequest;
use App\Models\Complaint;
use App\Services\ComplaintService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ComplaintController extends Controller
{
    public function __construct(private readonly ComplaintService $complaintService) {}

    public function index(Request $request): View
    {
        $filters = $request->query();
        if ($request->user()->role === 'TENANT') {
            $filters['tenant_id'] = $request->attributes->get('tenant_id');
        }

        $complaints = $this->complaintService->listComplaints($filters);

        return view('complaints.index', ['complaints' => $complaints]);
    }

    public function show(Request $request, Complaint $complaint): View
    {
        $tenantId = $request->user()->role === 'TENANT' ? $request->attributes->get('tenant_id') : null;

        return view('complaints.show', [
            'complaint' => $this->complaintService->getComplaintById($complaint->id, $tenantId),
        ]);
    }

    public function store(ComplaintRequest $request): RedirectResponse
    {
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = '/storage/'.$request->file('image')->store('complaints', 'public');
        }

        try {
            $this->complaintService->createComplaint(
                $request->validated(),
                $imagePath,
                $request->attributes->get('tenant_id'),
                $request->user()->id
            );
        } catch (AppException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Complaint submitted successfully.');
    }

    public function updateStatus(UpdateComplaintStatusRequest $request, Complaint $complaint): RedirectResponse
    {
        try {
            $this->complaintService->updateComplaintStatus(
                $complaint->id,
                $request->input('status'),
                $request->input('note'),
                $request->user()
            );
        } catch (AppException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Complaint status updated.');
    }
}
