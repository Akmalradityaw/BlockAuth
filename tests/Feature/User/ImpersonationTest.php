<?php

namespace Tests\Feature\User;

use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImpersonationTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->superAdmin = User::factory()->create([
            'email' => 'superadmin@blockauth.test',
        ]);
        $this->superAdmin->assignRole('SuperAdmin');

        $this->regularUser = User::factory()->create([
            'email' => 'user@blockauth.test',
        ]);
        $this->regularUser->assignRole('Viewer');
    }

    public function test_superadmin_bisa_memulai_impersonasi_pengguna_biasa(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('users.impersonate', $this->regularUser));

        $response->assertRedirect(route('dashboard'));
        $this->assertEquals($this->regularUser->id, auth()->id());
        $this->assertEquals($this->superAdmin->id, session('impersonator_id'));

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'user:impersonate_start',
            'user_id' => $this->regularUser->id,
        ]);
    }

    public function test_superadmin_tidak_bisa_impersonasi_sesama_superadmin_atau_diri_sendiri(): void
    {
        $otherSuperAdmin = User::factory()->create();
        $otherSuperAdmin->assignRole('SuperAdmin');

        $this->actingAs($this->superAdmin)
            ->post(route('users.impersonate', $otherSuperAdmin))
            ->assertSessionHasErrors('user');

        $this->actingAs($this->superAdmin)
            ->post(route('users.impersonate', $this->superAdmin))
            ->assertSessionHasErrors('user');
    }

    public function test_pengguna_biasa_ditolak_melakukan_impersonasi(): void
    {
        $target = User::factory()->create();

        $this->actingAs($this->regularUser)
            ->post(route('users.impersonate', $target))
            ->assertSessionHasErrors('user');
    }

    public function test_superadmin_bisa_menghentikan_impersonasi_dan_kembali_ke_akun_asli(): void
    {
        $this->actingAs($this->superAdmin)
            ->post(route('users.impersonate', $this->regularUser));

        $this->assertEquals($this->regularUser->id, auth()->id());

        $response = $this->post(route('impersonation.stop'));

        $response->assertRedirect(route('users.index'));
        $this->assertEquals($this->superAdmin->id, auth()->id());
        $this->assertFalse(session()->has('impersonator_id'));

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'user:impersonate_stop',
            'user_id' => $this->superAdmin->id,
        ]);
    }

    public function test_aksi_sensitif_dilarang_selama_impersonasi(): void
    {
        $this->actingAs($this->superAdmin)
            ->post(route('users.impersonate', $this->regularUser));

        $this->put('/password', [
            'current_password' => 'password',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])->assertSessionHas('warning');

        $this->delete('/profile', [
            'password' => 'password',
        ])->assertSessionHas('warning');
    }

    public function test_audit_log_merekam_impersonated_by_secara_otomatis(): void
    {
        session(['impersonator_id' => $this->superAdmin->id]);

        $log = AuditLog::record('profile:update', 'Mengubah profil', ['name' => 'Baru'], $this->regularUser);

        $this->assertNotNull($log);
        $this->assertEquals($this->superAdmin->id, $log->properties['impersonated_by'] ?? null);
    }
}

