<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\RbacSeeder::class);
    }

    public function test_halaman_registrasi_bisa_dibuka(): void
    {
        $response = $this->get('/register');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Auth/Register'));
    }

    public function test_pengguna_bisa_mendaftar_akun_baru(): void
    {
        $response = $this->post('/register', [
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseHas('users', ['email' => 'johndoe@example.com']);
        $this->assertAuthenticated();
    }
}

