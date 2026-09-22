<?php

namespace App\Http\Controllers;

use App\Exceptions\AppException;
use App\Http\Requests\TenantRequest;
use App\Models\Tenant;
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class TenantController extends Controller
{
    public function __construct(private readonly TenantService $tenantService) {}

    public function index(Request $request): View
    {
        $tenants = $this->tenantService->listTenants($request->query());

        return view('tenants.index', ['tenants' => $tenants]);
    }

    public function show(Request $request, Tenant $tenant): View
    {
        $user = $request->user();

        if ($user->role === 'TENANT' && $user->tenant?->id !== $tenant->id) {
            abort(403, 'You can only view your own profile.');
        }

        return view('tenants.show', ['tenant' => $this->tenantService->getTenantById($tenant->id)]);
    }

    public function store(TenantRequest $request): RedirectResponse
    {
        try {
            $this->tenantService->createTenant($request->validated(), $request->user());
        } catch (AppException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Tenant created successfully.');
    }

    public function update(TenantRequest $request, Tenant $tenant): RedirectResponse
    {
        $user = $request->user();
        if ($user->role === 'TENANT' && $user->tenant?->id !== $tenant->id) {
            abort(403, 'You can only update your own profile.');
        }

        try {
            $this->tenantService->updateTenant($tenant->id, $request->validated(), $user);
        } catch (AppException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Tenant updated successfully.');
    }

    public function profile(Request $request): View
    {
        return view('tenant.profile', ['tenant' => $this->tenantService->getTenantById($request->attributes->get('tenant_id'))]);
    }

    public function updateProfile(TenantRequest $request): RedirectResponse
    {
        try {
            $this->tenantService->updateTenant($request->attributes->get('tenant_id'), $request->validated(), $request->user());
        } catch (AppException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }
}
