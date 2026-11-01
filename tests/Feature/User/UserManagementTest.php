<?php

namespace Tests\Feature\User;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
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

    public function test_superadmin_bisa_melihat_daftar_pengguna_dengan_filter(): void
    {
        $response = $this->actingAs($this->admin)->get('/users?search=' . $this->viewer->name);

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Users/Index')
            ->has('users.data')
            ->has('filters')
            ->where('filters.search', $this->viewer->name)
        );
    }

    public function test_superadmin_bisa_menambah_pengguna_baru(): void
    {
        $payload = [
            'name' => 'Budi Baru',
            'email' => 'budibaru@example.com',
            'password' => 'password123',
            'role' => 'Staff',
            'bio' => 'Operator baru di kantor.',
            'verified' => true,
        ];

        $response = $this->actingAs($this->admin)->post('/users', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'email' => 'budibaru@example.com',
            'name' => 'Budi Baru',
        ]);

        $created = User::where('email', 'budibaru@example.com')->first();
        $this->assertTrue($created->hasRole('Staff'));
        $this->assertNotNull($created->email_verified_at);
    }

    public function test_superadmin_bisa_mengubah_data_pengguna_dan_role(): void
    {
        $target = User::factory()->create();
        $target->assignRole('Staff');

        $payload = [
            'name' => 'Budi Diubah',
            'email' => 'budidiubah@example.com',
            'role' => 'Editor',
            'bio' => 'Bio terupdate.',
            'verified' => true,
        ];

        $response = $this->actingAs($this->admin)->put("/users/{$target->id}", $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'name' => 'Budi Diubah',
            'email' => 'budidiubah@example.com',
        ]);

        $this->assertTrue($target->fresh()->hasRole('Editor'));
    }

    public function test_viewer_tidak_bisa_menambah_pengguna(): void
    {
        $payload = [
            'name' => 'Budi Gagal',
            'email' => 'budigagal@example.com',
            'password' => 'password123',
            'role' => 'Staff',
        ];

        $response = $this->actingAs($this->viewer)->post('/users', $payload);

        $response->assertForbidden();
    }

    public function test_superadmin_bisa_ekspor_csv_pengguna(): void
    {
        $response = $this->actingAs($this->admin)->get('/users/export?format=csv');

        $response->assertOk();
        $this->assertTrue(str_contains(
            $response->headers->get('content-type') ?? '',
            'text/csv'
        ));
    }
}

