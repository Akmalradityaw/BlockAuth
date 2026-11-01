<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\RbacSeeder::class);

        $this->user = User::factory()->create([
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $this->user->assignRole('Viewer');
    }

    public function test_halaman_login_bisa_dibuka(): void
    {
        $response = $this->get('/login');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Auth/Login'));
    }

    public function test_login_berhasil_mengarahkan_ke_dashboard(): void
    {
        $response = $this->post('/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($this->user);
    }

    public function test_login_gagal_menampilkan_error(): void
    {
        $response = $this->post('/login', [
            'email' => $this->user->email,
            'password' => 'password-salah',
        ]);

        $response->assertSessionHasErrors();
        $this->assertGuest();
    }

    public function test_pengguna_bisa_logout(): void
    {
        $response = $this->actingAs($this->user)->post('/logout');

        $response->assertRedirect('/login');
        $this->assertGuest();
    }
}
