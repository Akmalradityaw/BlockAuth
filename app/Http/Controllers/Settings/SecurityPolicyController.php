<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\UpdateSecurityPolicyAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateSecurityPolicyRequest;

class SecurityPolicyController extends Controller
{
    /**
     * Perbarui kebijakan keamanan kata sandi dan pembatasan login (brute-force throttling).
     */
    public function update(UpdateSecurityPolicyRequest $request, UpdateSecurityPolicyAction $action)
    {
        $action->execute($request->validated());

        return back()->with('success', 'Kebijakan keamanan berhasil diperbarui.');
    }
}

