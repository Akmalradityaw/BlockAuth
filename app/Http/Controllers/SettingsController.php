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
                'google' => Setting::get('auth.google'),
                'github' => Setting::get('auth.github'),
            ],
            'maintenance' => Setting::get('maintenance.enabled', false),
            'banner' => Setting::get('banner.text', ''),
        ]);
    }

    public function update(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'provider' => ['required', Rule::in(['google', 'github'])],
            'enabled' => ['required', 'boolean'],
        ]);

        Setting::set('auth.' . $data['provider'], (bool) $data['enabled']);

        // Toast dikirim dari frontend (pesan spesifik per provider).
        return back();
    }

    public function maintenance(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate(['enabled' => ['required', 'boolean']]);

        Setting::set('maintenance.enabled', (bool) $data['enabled']);

        return back();
    }

    public function banner(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate(['text' => ['nullable', 'string', 'max:200']]);

        Setting::set('banner.text', $data['text'] ?? '');

        return back();
    }
}
