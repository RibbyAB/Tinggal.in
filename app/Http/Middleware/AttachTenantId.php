<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AttachTenantId
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== 'TENANT') {
            return $next($request);
        }

        if (! $user->tenant) {
            abort(403, 'No tenant profile linked to this account.');
        }

        $request->attributes->set('tenant_id', $user->tenant->id);

        return $next($request);
    }
}
