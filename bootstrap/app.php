<?php

use App\Http\Middleware\CheckIpRules;
use App\Http\Middleware\CheckMaintenance;
use App\Http\Middleware\EnsureEmailVerificationIfEnabled;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            CheckIpRules::class,
            HandleInertiaRequests::class,
            CheckMaintenance::class,
            EnsureEmailVerificationIfEnabled::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, \Illuminate\Http\Request $request) {
            $status = $response->getStatusCode();

            if (in_array($status, [401, 403, 404, 419, 500, 503])) {
                if ($status === 419) {
                    return redirect()->back()->with('error', 'Sesi Anda telah kedaluwarsa. Silakan muat ulang halaman atau masuk kembali.');
                }

                if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                    return $response;
                }

                return \Inertia\Inertia::render('Error', [
                    'status' => $status,
                    'message' => $exception->getMessage() ?: null,
                ])->toResponse($request)->setStatusCode($status);
            }

            return $response;
        });
    })->create();
