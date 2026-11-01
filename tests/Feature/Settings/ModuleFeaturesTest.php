<?php

namespace Tests\Feature\Settings;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ModuleFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

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
    }

    protected function tearDown(): void
    {
        Setting::set('features.users', true);
        Setting::set('features.roles', true);
        Setting::set('features.audit_logs', true);
        Setting::set('features.registration', true);
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

    public function test_superadmin_bisa_mengatur_fitur_on_off_modul_dan_branding_ui(): void
    {
        $response = $this->actingAs($this->admin)->put('/settings', [
            'users' => false,
            'roles' => false,
            'audit_logs' => false,
            'registration' => false,
            'app_name' => 'Acme Portal',
            'app_tagline' => 'Portal Karyawan',
            'app_logo_url' => 'https://example.com/logo.png',
            'app_footer_text' => '© 2026 Acme Corp',
        ]);
        $response->assertSessionHas('success');
        $this->assertFalse((bool) Setting::get('features.users'));
        $this->assertFalse((bool) Setting::get('features.roles'));
        $this->assertEquals('Acme Portal', Setting::get('app.name'));
        $this->assertEquals('Portal Karyawan', Setting::get('app.tagline'));
        $this->assertEquals('https://example.com/logo.png', Setting::get('app.logo_url'));
        $this->assertEquals('© 2026 Acme Corp', Setting::get('app.footer_text'));
        $this->assertDatabaseHas('audit_logs', ['action' => 'settings:ui_modules_updated']);
    }

    public function test_akses_url_langsung_dicegat_jika_modul_dinonaktifkan(): void
    {
        Setting::set('features.audit_logs', false);
        $this->actingAs($this->admin)->get('/audit-logs')->assertRedirect('/dashboard')->assertSessionHas('warning');

        Setting::set('features.users', false);
        $this->actingAs($this->admin)->get('/users')->assertRedirect('/dashboard')->assertSessionHas('warning');

        Setting::set('features.roles', false);
        $this->actingAs($this->admin)->get('/roles/permissions')->assertRedirect('/dashboard')->assertSessionHas('warning');

        Setting::set('features.registration', false);
        auth()->logout();
        $this->get('/register')->assertRedirect('/login')->assertSessionHas('warning');
        $this->post('/register', ['name' => 'Tester', 'email' => 't@ex.com', 'password' => 'pwd12345'])->assertRedirect('/login')->assertSessionHas('warning');
    }
}

