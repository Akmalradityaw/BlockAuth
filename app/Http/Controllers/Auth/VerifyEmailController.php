<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard') . '?verified=1');
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));

            AuditLog::record(
                'auth:email_verified',
                'Alamat email berhasil diverifikasi',
                ['email' => $request->user()->email],
                $request->user()
            );
        }

        return redirect()->intended(route('dashboard') . '?verified=1')->with('success', 'Email berhasil diverifikasi.');
    }
}
