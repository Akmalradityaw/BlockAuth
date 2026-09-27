<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('settings:read');

        return Inertia::render('Settings/Index', [
            'toggles' => [
                'google' => Setting::get('auth.google', false),
                'github' => Setting::get('auth.github', false),
                'must_verify_email' => Setting::get('auth.must_verify_email', false),
            ],
            'maintenance' => Setting::get('maintenance.enabled', false),
            'banner' => Setting::get('banner.text', ''),
            'banner_style' => Setting::get('banner.style', 'warning'),
            'banner_enabled' => Setting::get('banner.enabled', false),
            'password_policy' => \App\Support\PasswordPolicy::get(),
            'brute_force' => [
                'max_attempts' => (int) Setting::get('auth.max_attempts', 5),
                'decay_minutes' => (int) Setting::get('auth.decay_minutes', 1),
            ],
            'stats' => [
                'ip_rules_count' => \App\Models\IpRule::count(),
                'ip_rules_active' => \App\Models\IpRule::where('is_active', true)->count(),
                'webhooks_count' => \App\Models\Webhook::count(),
                'webhooks_active' => \App\Models\Webhook::where('is_active', true)->count(),
                'announcements_count' => \App\Models\Announcement::count(),
                'announcements_active' => \App\Models\Announcement::where('is_active', true)->count(),
            ],
        ]);
    }

    public function toggle(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'key' => ['required', 'string', Rule::in([
                'auth.google',
                'auth.github',
                'auth.must_verify_email',
                'maintenance.enabled',
                'banner.enabled',
            ])],
            'value' => ['required', 'boolean'],
        ]);

        Setting::set($data['key'], $data['value']);

        \App\Models\AuditLog::record(
            'settings:toggle',
            "Mengubah pengaturan {$data['key']} menjadi " . ($data['value'] ? 'aktif' : 'nonaktif'),
            ['key' => $data['key'], 'value' => $data['value']]
        );

        if (! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        return back();
    }

    public function banner(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'text' => ['nullable', 'string', 'max:200'],
            'style' => ['nullable', 'string', Rule::in(['info', 'warning', 'critical'])],
        ]);

        Setting::set('banner.text', $data['text'] ?? '');
        Setting::set('banner.style', $data['style'] ?? 'warning');

        \App\Models\AuditLog::record(
            'settings:banner',
            'Memperbarui teks dan gaya pengumuman banner sistem',
            $data
        );

        if (! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        return back();
    }

    public function passwordPolicy(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'min_length' => ['required', 'integer', 'min:6', 'max:64'],
            'require_uppercase' => ['required', 'boolean'],
            'require_numeric' => ['required', 'boolean'],
            'require_special_char' => ['required', 'boolean'],
        ]);

        Setting::set('password_policy.min_length', (int) $data['min_length']);
        Setting::set('password_policy.require_uppercase', (bool) $data['require_uppercase']);
        Setting::set('password_policy.require_numeric', (bool) $data['require_numeric']);
        Setting::set('password_policy.require_special_char', (bool) $data['require_special_char']);

        \App\Models\AuditLog::record(
            'settings:password_policy',
            'Memperbarui kebijakan kompleksitas kata sandi sistem',
            $data
        );

        if (! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Kebijakan kata sandi berhasil diperbarui.');
    }

    public function bruteForce(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'max_attempts' => ['required', 'integer', 'min:3', 'max:20'],
            'decay_minutes' => ['required', 'integer', 'min:1', 'max:60'],
        ]);

        Setting::set('auth.max_attempts', (int) $data['max_attempts']);
        Setting::set('auth.decay_minutes', (int) $data['decay_minutes']);

        \App\Models\AuditLog::record(
            'settings:brute_force',
            'Memperbarui konfigurasi proteksi serangan brute force',
            $data
        );

        if (! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Konfigurasi proteksi brute force berhasil disimpan.');
    }
}
