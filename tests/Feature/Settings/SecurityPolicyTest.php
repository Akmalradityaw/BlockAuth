<?php

namespace Tests\Feature\Settings;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SecurityPolicyTest extends TestCase
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
        if (file_exists(storage_path('app/settings.json'))) {
            @unlink(storage_path('app/settings.json'));
        }
        \Illuminate\Support\Facades\Cache::forget('app_settings');

        parent::tearDown();
    }

    public function test_kebijakan_keamanan_password_dan_brute_force_berhasil_disimpan(): void
    {
        $response = $this->actingAs($this->admin)->put('/settings/security', [
            'min_length' => 12,
            'require_uppercase' => true,
            'require_numeric' => true,
            'require_special_char' => true,
            'must_verify_email' => true,
            'max_login_attempts' => 3,
            'decay_minutes' => 2,
        ]);

        $response->assertSessionHas('success');

        $policy = Setting::get('security.password_policy');
        $this->assertEquals(12, $policy['min_length']);
        $this->assertTrue($policy['require_uppercase']);
        $this->assertTrue($policy['require_numeric']);
        $this->assertTrue($policy['require_special_char']);
        $this->assertTrue((bool) Setting::get('auth.must_verify_email'));
        $this->assertEquals(3, Setting::get('security.max_login_attempts'));
        $this->assertEquals(2, Setting::get('security.decay_minutes'));

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'settings:security_updated',
        ]);
    }
}

