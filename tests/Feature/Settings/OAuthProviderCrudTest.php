<?php

namespace Tests\Feature\Settings;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OAuthProviderCrudTest extends TestCase
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
        if (file_exists(storage_path('app/settings.json'))) {
            @unlink(storage_path('app/settings.json'));
        }
        \Illuminate\Support\Facades\Cache::forget('app_settings');

        parent::tearDown();
    }

    public function test_superadmin_bisa_crud_provider_oauth_dinamis(): void
    {
        // 1. Tambah Provider
        $responseCreate = $this->actingAs($this->admin)->post('/settings/oauth/providers', [
            'provider_id' => 'gitlab-kantor',
            'name' => 'GitLab Kantor',
            'driver' => 'gitlab',
            'client_id' => 'gl-client-123',
            'client_secret' => 'gl-secret-xyz',
            'is_active' => true,
        ]);
        $responseCreate->assertSessionHas('success');

        $provider = Setting::getOAuthProvider('gitlab-kantor');
        $this->assertNotNull($provider);
        $this->assertEquals('gl-client-123', $provider['client_id']);
        $this->assertEquals('gl-secret-xyz', $provider['client_secret']);
        $this->assertTrue($provider['is_active']);

        // 2. Update Provider dengan Masked Secret
        $responseUpdate = $this->actingAs($this->admin)->put('/settings/oauth/providers/gitlab-kantor', [
            'name' => 'GitLab Kantor Updated',
            'driver' => 'gitlab',
            'client_id' => 'gl-client-updated',
            'client_secret' => '••••••••••••••••',
            'is_active' => true,
        ]);
        $responseUpdate->assertSessionHas('success');

        $updated = Setting::getOAuthProvider('gitlab-kantor');
        $this->assertEquals('GitLab Kantor Updated', $updated['name']);
        $this->assertEquals('gl-client-updated', $updated['client_id']);
        $this->assertEquals('gl-secret-xyz', $updated['client_secret']); // Tidak tertimpa

        // 3. Toggle Status Aktif
        $responseToggle = $this->actingAs($this->admin)->patch('/settings/oauth/providers/gitlab-kantor/toggle');
        $responseToggle->assertSessionHas('success');
        $this->assertFalse(Setting::getOAuthProvider('gitlab-kantor')['is_active']);

        // 4. Hapus Provider
        $responseDelete = $this->actingAs($this->admin)->delete('/settings/oauth/providers/gitlab-kantor');
        $responseDelete->assertSessionHas('success');
        $this->assertNull(Setting::getOAuthProvider('gitlab-kantor'));
    }

    public function test_oauth_callback_menangani_kegagalan_tanpa_error_500(): void
    {
        Setting::saveOAuthProvider('google', [
            'name' => 'Google',
            'driver' => 'google',
            'client_id' => 'fake-id',
            'client_secret' => 'fake-secret',
            'is_active' => true,
        ]);

        $response = $this->get('/oauth/google/callback');
        $response->assertRedirect('/login');
        $response->assertSessionHas('error');
    }
}

