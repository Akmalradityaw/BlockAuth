<?php

namespace Tests\Feature\User;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $viewer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\RbacSeeder::class);

        $this->admin = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $this->admin->assignRole('SuperAdmin');

        $this->viewer = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $this->viewer->assignRole('Viewer');
    }

    public function test_superadmin_bisa_mengakses_matriks_hak_akses_role(): void
    {
        $response = $this->actingAs($this->admin)->get('/roles/permissions');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('RolePermissions/Index')
            ->has('roles')
            ->has('allPermissions')
        );
    }

    public function test_viewer_ditolak_mengakses_matriks_hak_akses(): void
    {
        $response = $this->actingAs($this->viewer)->get('/roles/permissions');

        $response->assertForbidden();
    }

    public function test_superadmin_bisa_menyinkronkan_matriks_permissions(): void
    {
        $staffRole = Role::where('name', 'Staff')->firstOrFail();

        $response = $this->actingAs($this->admin)->put('/roles/permissions', [
            'matrix' => [
                $staffRole->id => ['users:read'],
            ],
        ]);

        $response->assertSessionHas('success');
        $this->assertTrue($staffRole->fresh()->hasPermissionTo('users:read'));
    }
}

