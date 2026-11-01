<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\TestMailConnectionAction;
use App\Actions\Settings\UpdateMailSettingsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateMailSettingsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MailSettingController extends Controller
{
    public function update(UpdateMailSettingsRequest $request, UpdateMailSettingsAction $action): RedirectResponse
    {
        $action->execute($request->validated());

        return redirect()->back()->with('success', 'Konfigurasi server email SMTP berhasil disimpan.');
    }

    public function test(Request $request, TestMailConnectionAction $action): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $result = $action->execute($request->input('email'));

        if ($result['success']) {
            return redirect()->back()->with('success', $result['message']);
        }

        return redirect()->back()->with('error', $result['message']);
    }
}

