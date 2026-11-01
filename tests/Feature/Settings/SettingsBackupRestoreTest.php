<?php

namespace Tests\Feature\Settings;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class SettingsBackupRestoreTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\RbacSeeder::class);

        $this->admin = User::factory()->create(['email_verified_at' => now()]);
        $this->admin->assignRole('SuperAdmin');

        Setting::set('app.name', 'BlockAuth Asli');
        Setting::set('mail.password', 'rahasia123');
    }

    public function test_superadmin_bisa_unduh_cadangan_konfigurasi(): void
    {
        $response = $this->actingAs($this->admin)->get('/settings/backup');
        $response->assertOk();

        $content = $response->streamedContent();
        $json = json_decode($content, true);

        $this->assertEquals('BlockAuth', $json['_meta']['app']);
        $this->assertEquals(1, $json['_meta']['schema_version']);

        // Verifikasi password SMTP disensor
        $mailPassSetting = collect($json['settings'])->firstWhere('key', 'mail.password');
        $this->assertEquals('__REDACTED__', $mailPassSetting['value']);
    }

    public function test_superadmin_bisa_restore_cadangan_dengan_smart_secret_preservation(): void
    {
        $backupPayload = [
            '_meta' => [
                'app' => 'BlockAuth',
                'schema_version' => 1,
            ],
            'settings' => [
                [
                    'key' => 'app.name',
                    'type' => 'string',
                    'value' => 'BlockAuth Baru',
                    'group' => 'app',
                ],
                [
                    'key' => 'mail.password',
                    'type' => 'encrypted',
                    'value' => '__REDACTED__',
                    'group' => 'mail',
                ],
            ],
        ];

        $file = UploadedFile::fake()->createWithContent('backup.json', json_encode($backupPayload));

        $response = $this->actingAs($this->admin)->post('/settings/restore', ['file' => $file]);
        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verifikasi app.name berubah
        $this->assertEquals('BlockAuth Baru', Setting::get('app.name'));

        // Verifikasi mail.password lama tetap dipertahankan karena di file nilainya __REDACTED__
        $this->assertEquals('rahasia123', Setting::get('mail.password'));
    }
}
