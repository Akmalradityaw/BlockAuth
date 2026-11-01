<?php

namespace Tests\Feature\Settings;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class GeneralSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $viewer;

    protected function setUp(): void
    {
        parent::setUp();

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
        Setting::set('maintenance.enabled', false);
        Setting::set('banner.enabled', false);
        if (file_exists(storage_path('app/settings.json'))) {
            @unlink(storage_path('app/settings.json'));
        }
        \Illuminate\Support\Facades\Cache::forget('app_settings');

        parent::tearDown();
    }

    public function test_superadmin_bisa_mengakses_halaman_pengaturan(): void
    {
        $response = $this->actingAs($this->admin)->get('/settings');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Settings/Index')
            ->has('general')
            ->has('oauth')
            ->has('security')
            ->has('features')
            ->has('app')
        );
    }

    public function test_pengguna_biasa_ditolak_mengubah_pengaturan(): void
    {
        $response = $this->actingAs($this->viewer)->put('/settings/maintenance', [
            'enabled' => true,
        ]);

        $response->assertForbidden();
    }

    public function test_superadmin_bisa_mengatur_mode_pemeliharaan_dan_banner_urgensi(): void
    {
        $responseMaintenance = $this->actingAs($this->admin)->put('/settings/maintenance', [
            'enabled' => true,
        ]);
        $responseMaintenance->assertSessionHas('success');
        $this->assertTrue((bool) Setting::get('maintenance.enabled'));

        $responseBanner = $this->actingAs($this->admin)->put('/settings/banner', [
            'text' => 'Pemberitahuan darurat',
            'style' => 'critical',
            'enabled' => true,
        ]);
        $responseBanner->assertSessionHas('success');
        $this->assertEquals('Pemberitahuan darurat', Setting::get('banner.text'));
        $this->assertEquals('critical', Setting::get('banner.style'));
        $this->assertTrue((bool) Setting::get('banner.enabled'));
    }

    public function test_superadmin_tidak_terkunci_saat_mode_pemeliharaan_aktif(): void
    {
        Setting::set('maintenance.enabled', true);

        // SuperAdmin bisa mengakses rute normal
        $responseAdmin = $this->actingAs($this->admin)->get('/dashboard');
        $responseAdmin->assertOk();

        // Pengguna biasa diblokir 503
        $responseViewer = $this->actingAs($this->viewer)->get('/dashboard');
        $responseViewer->assertStatus(503);

        // Rute login dan settings tetap lolos untuk akses anti-lockout
        auth()->logout();
        $responseLogin = $this->get('/login');
        $responseLogin->assertOk();
    }
}

