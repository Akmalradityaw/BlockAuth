<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Passkey;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PasskeyController extends Controller
{
    protected function getRpId(): string
    {
        $host = request()->getHost();
        return $host === '127.0.0.1' ? 'localhost' : $host;
    }

    public function generateRegisterOptions(Request $request): JsonResponse
    {
        $user = $request->user();
        $challenge = Str::random(32);
        $request->session()->put('webauthn_register_challenge', $challenge);

        $options = [
            'challenge' => base64_encode($challenge),
            'rp' => [
                'name' => config('app.name', 'BlockAuth'),
                'id' => $this->getRpId(),
            ],
            'user' => [
                'id' => base64_encode((string) $user->id),
                'name' => $user->email,
                'displayName' => $user->name,
            ],
            'pubKeyCredParams' => [
                ['type' => 'public-key', 'alg' => -7],   // ES256
                ['type' => 'public-key', 'alg' => -257], // RS256
            ],
            'timeout' => 60000,
            'attestation' => 'none',
            'authenticatorSelection' => [
                'residentKey' => 'preferred',
                'userVerification' => 'preferred',
            ],
        ];

        return response()->json($options);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'credential_id' => ['required', 'string'],
            'public_key' => ['nullable', 'string'],
        ]);

        $user = $request->user();

        $passkey = $user->passkeys()->create([
            'name' => $data['name'],
            'credential_id' => $data['credential_id'],
            'public_key' => $data['public_key'] ?? 'webauthn_key',
            'counter' => 0,
        ]);

        AuditLog::record(
            'passkey:registered',
            "Mendaftarkan Passkey / Kredensial Biometrik baru: {$passkey->name}",
            ['passkey_name' => $passkey->name]
        );

        return back()->with('success', "Passkey '{$passkey->name}' berhasil didaftarkan.");
    }

    public function destroy(Request $request, string|int $id)
    {
        $user = $request->user();
        $passkey = $user->passkeys()->where('id', $id)->firstOrFail();
        $name = $passkey->name;

        $passkey->delete();

        AuditLog::record(
            'passkey:deleted',
            "Menghapus Passkey / Kredensial Biometrik: {$name}",
            ['passkey_name' => $name]
        );

        return back()->with('success', "Passkey '{$name}' berhasil dihapus.");
    }

    public function generateAuthOptions(Request $request): JsonResponse
    {
        $challenge = Str::random(32);
        $request->session()->put('webauthn_auth_challenge', $challenge);

        $allowCredentials = [];
        if ($email = $request->input('email')) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $allowCredentials = $user->passkeys->map(function ($pk) {
                    return [
                        'id' => $pk->credential_id,
                        'type' => 'public-key',
                    ];
                })->all();
            }
        }

        $options = [
            'challenge' => base64_encode($challenge),
            'rpId' => $this->getRpId(),
            'timeout' => 60000,
            'userVerification' => 'preferred',
            'allowCredentials' => $allowCredentials,
        ];

        return response()->json($options);
    }

    public function verifyAuth(Request $request): JsonResponse
    {
        $data = $request->validate([
            'credential_id' => ['required', 'string'],
        ]);

        $passkey = Passkey::where('credential_id', $data['credential_id'])
            ->with('user')
            ->first();

        if (! $passkey || ! $passkey->user) {
            return response()->json([
                'success' => false,
                'message' => 'Passkey tidak terdaftar atau kredensial tidak valid.',
            ], 422);
        }

        $user = $passkey->user;

        $passkey->update([
            'last_used_at' => now(),
            'counter' => $passkey->counter + 1,
        ]);

        Auth::login($user, true);
        $request->session()->regenerate();

        AuditLog::record(
            'auth:passkey_login',
            "Berhasil masuk ke dalam sistem menggunakan Passkey: {$passkey->name}",
            ['passkey_name' => $passkey->name],
            $user
        );

        return response()->json([
            'success' => true,
            'redirect' => route('dashboard'),
        ]);
    }
}
