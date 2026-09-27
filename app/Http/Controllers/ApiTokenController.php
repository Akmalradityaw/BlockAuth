<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApiTokenController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'abilities' => ['nullable', 'array'],
            'abilities.*' => ['string', Rule::in(['read', 'write', 'delete'])],
        ]);

        $abilities = ! empty($data['abilities']) ? $data['abilities'] : ['read'];

        $user = $request->user();
        $token = $user->createToken($data['name'], $abilities);

        AuditLog::record(
            'api_token:created',
            "Membuat API Personal Access Token: {$data['name']}",
            ['name' => $data['name'], 'abilities' => $abilities]
        );

        return back()
            ->with('success', 'API Token berhasil dibuat. Harap salin token Anda sekarang.')
            ->with('new_token', [
                'id' => $token->accessToken->id,
                'name' => $token->accessToken->name,
                'plainTextToken' => $token->plainTextToken,
                'abilities' => $abilities,
            ]);
    }

    public function destroy(Request $request, string|int $id)
    {
        $user = $request->user();
        $token = $user->tokens()->where('id', $id)->firstOrFail();
        $name = $token->name;

        $token->delete();

        AuditLog::record(
            'api_token:revoked',
            "Mencabut API Personal Access Token: {$name}",
            ['token_id' => $id, 'name' => $name]
        );

        return back()->with('success', "API Token '{$name}' berhasil dicabut.");
    }
}
