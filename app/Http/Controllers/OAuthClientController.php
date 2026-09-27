<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\OAuthClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OAuthClientController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('settings:read');

        $query = OAuthClient::with('user:id,name,email');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('client_id', 'like', "%{$search}%")
                  ->orWhere('redirect_uri', 'like', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $clients = $query->latest()->paginate($request->input('per_page', 10))->withQueryString();

        $stats = [
            'total' => OAuthClient::count(),
            'active' => OAuthClient::where('is_active', true)->count(),
        ];

        $availableScopes = [
            ['key' => 'profile', 'label' => 'Profil Pengguna', 'desc' => 'Melihat nama, email, bio, dan foto avatar pengguna'],
            ['key' => 'email', 'label' => 'Alamat Email', 'desc' => 'Melihat status verifikasi dan alamat email resmi'],
            ['key' => 'users:read', 'label' => 'Baca Direktori Pengguna', 'desc' => 'Melihat daftar akun dan hierarki organisasi'],
            ['key' => 'users:write', 'label' => 'Kelola Data Pengguna', 'desc' => 'Membuat atau memperbarui profil pengguna'],
        ];

        return Inertia::render('Developer/OAuthClients', [
            'clients' => $clients,
            'filters' => $request->only(['search', 'is_active', 'per_page']),
            'stats' => $stats,
            'availableScopes' => $availableScopes,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'redirect_uri' => ['required', 'url'],
            'scopes' => ['required', 'array', 'min:1'],
            'scopes.*' => ['string'],
        ]);

        $client = OAuthClient::create([
            'user_id' => $request->user()->id,
            'name' => $data['name'],
            'redirect_uri' => $data['redirect_uri'],
            'scopes' => $data['scopes'],
            'is_active' => true,
        ]);

        AuditLog::record('oauth_client:created', "Mendaftarkan aplikasi OAuth baru: {$client->name}", [
            'client_id' => $client->client_id,
        ], $request->user());

        return back()->with('success', "Aplikasi '{$client->name}' berhasil didaftarkan.");
    }

    public function update(Request $request, OAuthClient $oauthClient)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'redirect_uri' => ['required', 'url'],
            'scopes' => ['required', 'array', 'min:1'],
            'scopes.*' => ['string'],
        ]);

        $oauthClient->update($data);

        return back()->with('success', 'Konfigurasi aplikasi OAuth berhasil diperbarui.');
    }

    public function regenerateSecret(Request $request, OAuthClient $oauthClient)
    {
        Gate::authorize('settings:manage');

        $newSecret = 'ba_sec_' . Str::random(48);
        $oauthClient->update(['client_secret' => $newSecret]);

        AuditLog::record('oauth_client:regenerate_secret', "Meregenerasi client secret untuk aplikasi: {$oauthClient->name}", [
            'client_id' => $oauthClient->client_id,
        ], $request->user());

        return back()->with('success', 'Client Secret berhasil diperbarui. Pastikan memperbarui konfigurasi pada aplikasi Anda.');
    }

    public function toggle(Request $request, OAuthClient $oauthClient)
    {
        Gate::authorize('settings:manage');

        $oauthClient->update(['is_active' => ! $oauthClient->is_active]);

        return back()->with('success', 'Status aplikasi OAuth berhasil diperbarui.');
    }

    public function destroy(Request $request, OAuthClient $oauthClient)
    {
        Gate::authorize('settings:manage');

        $name = $oauthClient->name;
        $oauthClient->delete();

        AuditLog::record('oauth_client:deleted', "Mencabut dan menghapus aplikasi OAuth: {$name}", [
            'client_id' => $oauthClient->client_id,
        ], $request->user());

        return back()->with('success', "Aplikasi '{$name}' telah dihapus.");
    }
}
