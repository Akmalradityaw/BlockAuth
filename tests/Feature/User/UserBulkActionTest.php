<?php

namespace Tests\Feature\User;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserBulkActionTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $user1;
    protected User $user2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\RbacSeeder::class);

        $this->admin = User::factory()->create(['email_verified_at' => now()]);
        $this->admin->assignRole('SuperAdmin');

        $this->user1 = User::factory()->create(['email_verified_at' => null]);
        $this->user1->assignRole('Staff');

        $this->user2 = User::factory()->create(['email_verified_at' => null]);
        $this->user2->assignRole('Staff');
    }

    public function test_bulk_verify_memverifikasi_banyak_pengguna_sekaligus(): void
    {
        $response = $this->actingAs($this->admin)->post('/users/bulk-verify', [
            'user_ids' => [$this->user1->id, $this->user2->id],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertNotNull($this->user1->fresh()->email_verified_at);
        $this->assertNotNull($this->user2->fresh()->email_verified_at);
    }

    public function test_bulk_role_mengubah_peran_banyak_pengguna(): void
    {
        $response = $this->actingAs($this->admin)->post('/users/bulk-role', [
            'user_ids' => [$this->user1->id, $this->user2->id],
            'role' => 'Editor',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertTrue($this->user1->fresh()->hasRole('Editor'));
        $this->assertTrue($this->user2->fresh()->hasRole('Editor'));
    }

    public function test_bulk_delete_menghapus_pengguna_terpilih(): void
    {
        $response = $this->actingAs($this->admin)->post('/users/bulk-delete', [
            'user_ids' => [$this->user1->id, $this->user2->id],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $this->user1->id]);
        $this->assertDatabaseMissing('users', ['id' => $this->user2->id]);
    }

    public function test_bulk_delete_menolak_menghapus_akun_sendiri_saja(): void
    {
        $response = $this->actingAs($this->admin)->post('/users/bulk-delete', [
            'user_ids' => [$this->admin->id],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    public function test_bulk_delete_menolak_menghapus_seluruh_superadmin(): void
    {
        $manager = User::factory()->create(['email_verified_at' => now()]);
        $manager->assignRole('Manager');

        // Manager mencoba menghapus seluruh SuperAdmin yang ada di sistem
        $allSuperAdminIds = User::role('SuperAdmin')->pluck('id')->all();
        $response = $this->actingAs($manager)->post('/users/bulk-delete', [
            'user_ids' => $allSuperAdminIds,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }
}
