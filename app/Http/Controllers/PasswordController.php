<?php

namespace App\Http\Controllers;

use App\Actions\Profile\UpdateUserPasswordAction;
use App\Http\Requests\UpdatePasswordRequest;

class PasswordController extends Controller
{
    public function update(UpdatePasswordRequest $request, UpdateUserPasswordAction $action)
    {
        $action->execute($request->user(), $request->validated()['password']);

        return back()->with('status', 'Password berhasil diperbarui.');
    }
}
