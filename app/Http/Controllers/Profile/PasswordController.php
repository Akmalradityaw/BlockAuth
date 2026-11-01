<?php

namespace App\Http\Controllers\Profile;

use App\Actions\Profile\UpdateUserPasswordAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Models\AuditLog;

class PasswordController extends Controller
{
    public function update(UpdatePasswordRequest $request, UpdateUserPasswordAction $action)
    {
        $action->execute($request->user(), $request->validated()['password']);

        AuditLog::record('password:change', 'Memperbarui kata sandi akun');

        return back()->with('success', 'Password berhasil diperbarui.');
    }
}

