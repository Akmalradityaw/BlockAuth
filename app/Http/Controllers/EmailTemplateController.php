<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class EmailTemplateController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('settings:read');

        $templates = EmailTemplate::orderBy('name')->get();

        $stats = [
            'total' => $templates->count(),
            'active' => $templates->where('is_active', true)->count(),
        ];

        return Inertia::render('Settings/EmailTemplates', [
            'templates' => $templates,
            'stats' => $stats,
        ]);
    }

    public function update(Request $request, EmailTemplate $emailTemplate)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'subject' => ['required', 'string', 'max:200'],
            'body' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $emailTemplate->update([
            'subject' => $data['subject'],
            'body' => $data['body'],
            'is_active' => $data['is_active'] ?? $emailTemplate->is_active,
        ]);

        AuditLog::record('email_template:updated', "Memperbarui template email: {$emailTemplate->name}", [
            'code' => $emailTemplate->code,
        ], $request->user());

        return back()->with('success', "Template email '{$emailTemplate->name}' berhasil diperbarui.");
    }

    public function reset(Request $request, EmailTemplate $emailTemplate)
    {
        Gate::authorize('settings:manage');

        $defaults = [
            'email_verification' => [
                'subject' => 'Verifikasi Alamat Email Anda - BlockAuth',
                'body' => "Halo {{user_name}},\n\nTerima kasih telah mendaftar di sistem kami. Silakan klik tautan di bawah ini untuk memverifikasi alamat email Anda:\n\n{{action_url}}\n\nTautan ini hanya berlaku selama 60 menit. Jika Anda tidak merasa mendaftar, abaikan email ini.\n\nSalam,\nTim Keamanan BlockAuth",
            ],
            'password_reset' => [
                'subject' => 'Permintaan Reset Kata Sandi Akun Anda',
                'body' => "Halo {{user_name}},\n\nKami menerima permintaan untuk mereset kata sandi akun Anda. Anda dapat mengatur ulang kata sandi melalui tautan berikut:\n\n{{action_url}}\n\nJika Anda tidak meminta pengaturan ulang sandi, segera amankan akun Anda.\n\nSalam,\nTim Keamanan BlockAuth",
            ],
            'new_device_login' => [
                'subject' => 'Peringatan Keamanan: Login dari Perangkat Baru',
                'body' => "Halo {{user_name}},\n\nAkun Anda baru saja terdeteksi masuk dari perangkat yang belum pernah digunakan sebelumnya:\n\n- Waktu: {{login_time}}\n- Alamat IP: {{ip_address}}\n- Perangkat/Browser: {{device_name}}\n\nJika ini bukan aktivitas Anda, segera putuskan sesi dan ubah kata sandi di {{action_url}}.\n\nSalam,\nSistem Proteksi BlockAuth",
            ],
            'account_lockout' => [
                'subject' => 'Akun Anda Telah Dikunci Sementara',
                'body' => "Halo {{user_name}},\n\nSistem proteksi otomatis kami mendeteksi percobaan login gagal berulang kali ke akun Anda. Akun Anda telah dikunci sementara selama {{decay_minutes}} menit untuk mencegah serangan brute force.\n\nAlamat IP pemicu: {{ip_address}}\n\nSalam,\nTim Keamanan BlockAuth",
            ],
        ];

        if (isset($defaults[$emailTemplate->code])) {
            $emailTemplate->update($defaults[$emailTemplate->code]);
        }

        return back()->with('success', "Template '{$emailTemplate->name}' telah dikembalikan ke format standar.");
    }

    public function sendTest(Request $request, EmailTemplate $emailTemplate)
    {
        Gate::authorize('settings:manage');

        AuditLog::record('email_template:test_sent', "Mengirim email uji coba template: {$emailTemplate->name} ke {$request->user()->email}", [
            'code' => $emailTemplate->code,
        ], $request->user());

        return back()->with('success', "Simulasi pengiriman email uji coba '{$emailTemplate->name}' telah dikirim ke {$request->user()->email}.");
    }
}
