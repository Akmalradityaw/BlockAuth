<?php

namespace App\Actions\Settings;

use App\Models\AuditLog;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateModuleFeaturesAction
{
    public function execute(array $data, ?User $user = null): void
    {
        if (isset($data['users'])) {
            Setting::set('features.users', (bool) $data['users']);
        }
        if (isset($data['roles'])) {
            Setting::set('features.roles', (bool) $data['roles']);
        }
        if (isset($data['audit_logs'])) {
            Setting::set('features.audit_logs', (bool) $data['audit_logs']);
        }
        if (isset($data['registration'])) {
            Setting::set('features.registration', (bool) $data['registration']);
        }
        if (isset($data['magic_link'])) {
            Setting::set('features.magic_link', (bool) $data['magic_link']);
        }

        if (array_key_exists('app_name', $data)) {
            Setting::set('app.name', trim((string) $data['app_name']));
        }
        if (array_key_exists('app_tagline', $data)) {
            Setting::set('app.tagline', trim((string) $data['app_tagline']));
        }
        if (array_key_exists('app_footer_text', $data)) {
            Setting::set('app.footer_text', trim((string) $data['app_footer_text']));
        }

        $removeLogo = ! empty($data['remove_logo']);

        if ($removeLogo) {
            $this->deleteStoredLogo();
            Setting::set('app.logo_url', '');
        } elseif (isset($data['app_logo_file']) && $data['app_logo_file'] instanceof UploadedFile) {
            $this->deleteStoredLogo();
            $file = $data['app_logo_file'];
            $extension = $file->getClientOriginalExtension() ?: 'png';
            $filename = 'logo_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
            $path = Storage::disk('public')->putFileAs('branding', $file, $filename);
            Setting::set('app.logo_url', Storage::disk('public')->url($path));
        } elseif (array_key_exists('app_logo_url', $data)) {
            Setting::set('app.logo_url', trim((string) $data['app_logo_url']));
        }

        AuditLog::record(
            'settings:ui_modules_updated',
            'Memperbarui branding antarmuka dan modul halaman sistem',
            [
                'app_name' => $data['app_name'] ?? null,
                'app_logo_url' => Setting::get('app.logo_url', ''),
                'features' => [
                    'users' => $data['users'] ?? null,
                    'roles' => $data['roles'] ?? null,
                    'audit_logs' => $data['audit_logs'] ?? null,
                    'registration' => $data['registration'] ?? null,
                ],
            ],
            $user
        );
    }

    protected function deleteStoredLogo(): void
    {
        $currentLogoUrl = (string) Setting::get('app.logo_url', '');
        if (! $currentLogoUrl) {
            return;
        }

        $parsed = parse_url($currentLogoUrl, PHP_URL_PATH);
        if ($parsed && str_starts_with($parsed, '/storage/branding/')) {
            $storagePath = substr($parsed, strlen('/storage/'));
            if (Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
            }
        }
    }
}

