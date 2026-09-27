<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Webhook;
use App\Services\WebhookDispatcher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

use Inertia\Inertia;

class WebhookController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('settings:read');

        $webhooks = Webhook::with(['deliveries' => function ($q) {
            $q->latest()->limit(20);
        }])->latest()->get();

        $totalDeliveries = \App\Models\WebhookDelivery::count();
        $successfulDeliveries = \App\Models\WebhookDelivery::where('response_status', '>=', 200)
            ->where('response_status', '<', 300)
            ->count();

        $stats = [
            'total' => $webhooks->count(),
            'active' => $webhooks->where('is_active', true)->count(),
            'total_deliveries' => $totalDeliveries,
            'success_rate' => $totalDeliveries > 0 ? round(($successfulDeliveries / $totalDeliveries) * 100, 1) : 100,
        ];

        $availableEvents = [
            ['key' => 'user.registered', 'label' => 'Registrasi Pengguna Baru', 'desc' => 'Ditembak saat pengguna baru berhasil mendaftar'],
            ['key' => 'user.deleted', 'label' => 'Penghapusan Akun', 'desc' => 'Ditembak saat akun pengguna dihapus dari sistem'],
            ['key' => 'auth.login', 'label' => 'Login Berhasil', 'desc' => 'Ditembak saat pengguna berhasil login ke sistem'],
            ['key' => 'auth.lockout', 'label' => 'Akun Terkunci (Brute Force)', 'desc' => 'Ditembak saat akun terkunci akibat salah password berulang'],
            ['key' => 'auth.new_device', 'label' => 'Perangkat Login Baru', 'desc' => 'Ditembak saat login terdeteksi dari browser/IP baru'],
            ['key' => 'role.updated', 'label' => 'Perubahan Peran / Hak Akses', 'desc' => 'Ditembak saat role atau permission diubah'],
        ];

        return Inertia::render('Developer/Webhooks', [
            'webhooks' => $webhooks,
            'stats' => $stats,
            'availableEvents' => $availableEvents,
        ]);
    }
    public function store(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'url' => ['required', 'url', 'max:255'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['string', Rule::in([
                '*',
                'user.registered',
                'user.deleted',
                'auth.login',
                'auth.lockout',
                'auth.new_device',
                'role.updated',
            ])],
        ]);

        $webhook = Webhook::create([
            'name' => $data['name'],
            'url' => $data['url'],
            'secret' => Webhook::generateSecret(),
            'events' => $data['events'],
            'is_active' => true,
        ]);

        AuditLog::record(
            'webhook:created',
            "Mendaftarkan webhook baru: {$webhook->name} ({$webhook->url})",
            ['name' => $webhook->name, 'url' => $webhook->url, 'events' => $webhook->events]
        );

        return back()->with('success', "Webhook '{$webhook->name}' berhasil didaftarkan.");
    }

    public function destroy(Webhook $webhook)
    {
        Gate::authorize('settings:manage');

        $name = $webhook->name;
        $webhook->delete();

        AuditLog::record(
            'webhook:deleted',
            "Menghapus endpoint webhook: {$name}",
            ['name' => $name]
        );

        return back()->with('success', "Webhook '{$name}' berhasil dihapus.");
    }

    public function ping(Webhook $webhook)
    {
        Gate::authorize('settings:manage');

        $delivery = WebhookDispatcher::send($webhook, 'webhook.ping', [
            'test' => true,
            'message' => 'Tes konektivitas webhook BlockAuth berhasil diterima.',
            'triggered_by' => auth()->user()->email,
            'timestamp' => now()->toIso8601String(),
        ]);

        $statusText = $delivery->response_status ? "HTTP {$delivery->response_status}" : 'Koneksi Gagal';

        return back()->with('success', "Ping uji coba selesai dikirim ke {$webhook->name} ({$statusText}, {$delivery->duration_ms}ms).");
    }

    public function toggle(Webhook $webhook)
    {
        Gate::authorize('settings:manage');

        $webhook->update([
            'is_active' => ! $webhook->is_active,
        ]);

        $status = $webhook->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Webhook '{$webhook->name}' berhasil {$status}.");
    }
}
