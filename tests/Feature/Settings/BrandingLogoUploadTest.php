<?php

namespace Tests\Feature\Settings;

use App\Models\AuditLog;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BrandingLogoUploadTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $viewer;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        if (file_exists(storage_path('app/settings.json'))) {
            @unlink(storage_path('app/settings.json'));
        }
        \Illuminate\Support\Facades\Cache::forget('app_settings');

        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\RbacSeeder::class);

        $this->admin = User::factory()->create([
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $this->admin->assignRole('SuperAdmin');

        $this->viewer = User::factory()->create([
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $this->viewer->assignRole('Viewer');
    }

    protected function tearDown(): void
    {
        Setting::set('app.name', 'BlockAuth');
        Setting::set('app.tagline', 'Auth dan Profil');
        Setting::set('app.logo_url', null);
        Setting::set('app.footer_text', null);
        if (file_exists(storage_path('app/settings.json'))) {
            @unlink(storage_path('app/settings.json'));
        }
        \Illuminate\Support\Facades\Cache::forget('app_settings');

        parent::tearDown();
    }

    public function test_superadmin_bisa_mengunggah_file_logo_aplikasi(): void
    {
        $file = UploadedFile::fake()->image('custom_logo.png', 200, 200);

        $response = $this->actingAs($this->admin)->post('/settings/modules', [
            '_method' => 'put',
            'app_name' => 'BlockAuth Enterprise',
            'app_tagline' => 'Sistem Terpadu',
            'app_logo_file' => $file,
            'users' => true,
        ]);

        $response->assertSessionHas('success');

        $savedLogoUrl = Setting::get('app.logo_url');
        $this->assertNotEmpty($savedLogoUrl);
        $this->assertStringContainsString('/storage/branding/', $savedLogoUrl);

        $parsedPath = parse_url($savedLogoUrl, PHP_URL_PATH);
        $storagePath = substr($parsedPath, strlen('/storage/'));
        Storage::disk('public')->assertExists($storagePath);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'settings:ui_modules_updated',
        ]);
    }

    public function test_superadmin_bisa_menghapus_logo_aplikasi(): void
    {
        $initialFile = UploadedFile::fake()->image('old_logo.png');
        $initialPath = Storage::disk('public')->putFileAs('branding', $initialFile, 'old_logo.png');
        Setting::set('app.logo_url', Storage::disk('public')->url($initialPath));

        Storage::disk('public')->assertExists($initialPath);

        $response = $this->actingAs($this->admin)->post('/settings/modules', [
            '_method' => 'put',
            'remove_logo' => true,
            'app_name' => 'BlockAuth',
        ]);

        $response->assertSessionHas('success');
        $this->assertSame('', Setting::get('app.logo_url'));
        Storage::disk('public')->assertMissing($initialPath);
    }

    public function test_mengunggah_logo_baru_otomatis_menghapus_file_logo_lama(): void
    {
        $oldFile = UploadedFile::fake()->image('first_logo.png');
        $oldPath = Storage::disk('public')->putFileAs('branding', $oldFile, 'first_logo.png');
        Setting::set('app.logo_url', Storage::disk('public')->url($oldPath));

        Storage::disk('public')->assertExists($oldPath);

        $newFile = UploadedFile::fake()->image('second_logo.png');
        $response = $this->actingAs($this->admin)->post('/settings/modules', [
            '_method' => 'put',
            'app_logo_file' => $newFile,
            'app_name' => 'BlockAuth',
        ]);

        $response->assertSessionHas('success');
        Storage::disk('public')->assertMissing($oldPath);

        $savedLogoUrl = Setting::get('app.logo_url');
        $parsedPath = parse_url($savedLogoUrl, PHP_URL_PATH);
        $storagePath = substr($parsedPath, strlen('/storage/'));
        Storage::disk('public')->assertExists($storagePath);
    }

    public function test_validasi_menolak_file_bukan_gambar_atau_melebihi_ukuran(): void
    {
        $pdfFile = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->admin)->post('/settings/modules', [
            '_method' => 'put',
            'app_logo_file' => $pdfFile,
        ]);

        $response->assertSessionHasErrors('app_logo_file');
    }
}

