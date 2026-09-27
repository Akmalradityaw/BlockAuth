<?php

namespace App\Http\Controllers;

use App\Actions\Profile\UpdateUserPasswordAction;
use App\Http\Requests\UpdatePasswordRequest;
use App\Models\AuditLog;

class PasswordController extends Controller
{
    public function update(UpdatePasswordRequest $request, UpdateUserPasswordAction $action)
    {
        $action->execute($request->user(), $request->validated()['password']);

        AuditLog::record('profile:password_change', 'Memperbarui kata sandi akun');

        return back()->with('success', 'Password berhasil diperbarui.');
    }
}