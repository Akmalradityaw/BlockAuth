<?php

namespace Tests\Feature\Settings;

use App\Models\Setting;
use App\Models\User;
use App\Support\SecurityHealthCalculator;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHealthTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('SuperAdmin');
    }

    public function test_security_health_calculator_menghasilkan_skor_dan_metrik(): void
    {
        $health = SecurityHealthCalculator::calculate();

        $this->assertIsArray($health);
        $this->assertArrayHasKey('score', $health);
        $this->assertArrayHasKey('grade', $health);
        $this->assertArrayHasKey('status', $health);
        $this->assertArrayHasKey('items', $health);
        $this->assertGreaterThanOrEqual(0, $health['score']);
        $this->assertLessThanOrEqual(100, $health['score']);
    }

    public function test_superadmin_bisa_mengaktifkan_deteksi_sandi_bocor_haveibeenpwned(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->put('/settings/security', [
                'min_length' => 10,
                'require_uppercase' => true,
                'require_numeric' => true,
                'require_special_char' => true,
                'check_pwned_passwords' => true,
                'max_login_attempts' => 5,
                'decay_minutes' => 2,
            ]);

        $response->assertSessionHasNoErrors();

        $policy = Setting::get('security.password_policy');
        $this->assertTrue($policy['check_pwned_passwords'] ?? false);
    }

    public function test_dashboard_mengirimkan_prop_security_health_untuk_superadmin(): void
    {
        $this->actingAs($this->superAdmin)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->has('securityHealth')
                ->where('securityHealth.grade', fn ($val) => in_array($val, ['A', 'B', 'C', 'D']))
            );
    }
}

