<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'active' => \App\Http\Middleware\EnsureUserIsActive::class,
            'tenant.scope' => \App\Http\Middleware\AttachTenantId::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\App\Exceptions\AppException $e) {
            return response()->view('errors.app', [
                'status' => $e->statusCode,
                'message' => $e->getMessage(),
            ], $e->statusCode);
        });

        $exceptions->render(function (\Illuminate\Database\QueryException $e) {
            if ((string) $e->getCode() === '23000') {
                return back()
                    ->withInput()
                    ->with('error', 'Data dengan detail yang sama sudah ada. Periksa kembali isian yang harus unik.');
            }

            return null;
        });
    })->create();
