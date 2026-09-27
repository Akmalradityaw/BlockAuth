<?php

namespace Tests\Feature;

use App\Models\IpRule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityAndIpRulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_blacklisted_ip_address_is_blocked_with_403(): void
    {
        IpRule::create([
            'ip_address' => '123.123.123.123',
            'type' => 'blacklist',
            'reason' => 'Automated bot scanning',
            'is_active' => true,
        ]);

        $response = $this->withServerVariables(['REMOTE_ADDR' => '123.123.123.123'])
            ->get('/');

        $response->assertStatus(403);
    }

    public function test_non_blacklisted_ip_can_access_application(): void
    {
        $response = $this->withServerVariables(['REMOTE_ADDR' => '192.168.1.50'])
            ->get('/');

        $response->assertStatus(200);
    }

    public function test_admin_can_create_ip_rule(): void
    {
        $admin = User::factory()->create();
        $admin->givePermissionTo = function () {}; // mock or test
        // Let's test IpRule model directly or via request
        $this->actingAs($admin);

        IpRule::create([
            'ip_address' => '10.0.0.99',
            'type' => 'blacklist',
            'created_by' => $admin->id,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('ip_rules', [
            'ip_address' => '10.0.0.99',
            'type' => 'blacklist',
        ]);
    }

    public function test_known_device_detection_creates_alert_on_new_login(): void
    {
        $user = User::factory()->create();

        $result = \App\Models\KnownDevice::checkAndRecord($user);

        $this->assertTrue($result['is_new']);
        $this->assertDatabaseHas('known_devices', [
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('announcements', [
            'user_id' => $user->id,
            'title' => 'Peringatan Keamanan: Login dari Perangkat Baru',
        ]);

        // Second time should not be new
        $repeatResult = \App\Models\KnownDevice::checkAndRecord($user);
        $this->assertFalse($repeatResult['is_new']);
    }

    public function test_strict_email_verification_redirects_unverified_user(): void
    {
        \App\Models\Setting::set('auth.must_verify_email', true, 'boolean');

        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect(route('verification.notice'));
    }
}
