<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SessionSecurityTest extends TestCase
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

    public function test_pengguna_bisa_melihat_daftar_sesi_di_halaman_profil(): void
    {
        DB::table('sessions')->insert([
            'id' => 'session_device_1',
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.100',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
            'payload' => 'dummy_payload',
            'last_activity' => time(),
        ]);

        $response = $this->actingAs($this->user)->get('/profile');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Profile/Edit')
            ->has('sessions')
            ->where('sessions.0.id', 'session_device_1')
            ->where('sessions.0.browser', 'Google Chrome')
            ->where('sessions.0.platform', 'Windows')
        );
    }

    public function test_pengguna_bisa_mencabut_satu_sesi_perangkat_lain(): void
    {
        DB::table('sessions')->insert([
            [
                'id' => 'current_session_id',
                'user_id' => $this->user->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'payload' => 'payload1',
                'last_activity' => time(),
            ],
            [
                'id' => 'other_session_id',
                'user_id' => $this->user->id,
                'ip_address' => '10.0.0.2',
                'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
                'payload' => 'payload2',
                'last_activity' => time() - 3600,
            ],
        ]);

        $response = $this->actingAs($this->user)
            ->withSession(['_token' => 'dummy'])
            ->delete('/profile/sessions/other_session_id');

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('sessions', [
            'id' => 'other_session_id',
        ]);
        $this->assertDatabaseHas('sessions', [
            'id' => 'current_session_id',
        ]);
    }

    public function test_pengguna_tidak_bisa_mencabut_sesi_milik_pengguna_lain(): void
    {
        $otherUser = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);

        DB::table('sessions')->insert([
            'id' => 'victim_session_id',
            'user_id' => $otherUser->id,
            'ip_address' => '10.0.0.99',
            'user_agent' => 'Mozilla/5.0',
            'payload' => 'payload',
            'last_activity' => time(),
        ]);

        $response = $this->actingAs($this->user)
            ->delete('/profile/sessions/victim_session_id');

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('sessions', [
            'id' => 'victim_session_id',
        ]);
    }

    public function test_pengguna_bisa_mencabut_seluruh_sesi_lain_dengan_kata_sandi_benar(): void
    {
        $currentSessionId = 'active_browser_session';

        DB::table('sessions')->insert([
            [
                'id' => $currentSessionId,
                'user_id' => $this->user->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0',
                'payload' => 'p1',
                'last_activity' => time(),
            ],
            [
                'id' => 'other_device_1',
                'user_id' => $this->user->id,
                'ip_address' => '192.168.1.5',
                'user_agent' => 'Mozilla/5.0',
                'payload' => 'p2',
                'last_activity' => time() - 1000,
            ],
            [
                'id' => 'other_device_2',
                'user_id' => $this->user->id,
                'ip_address' => '192.168.1.6',
                'user_agent' => 'Mozilla/5.0',
                'payload' => 'p3',
                'last_activity' => time() - 2000,
            ],
        ]);

        session()->setId($currentSessionId);

        $response = $this->actingAs($this->user)
            ->post('/profile/sessions/revoke-others', [
                'password' => 'password123',
            ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('sessions', ['id' => 'other_device_1']);
        $this->assertDatabaseMissing('sessions', ['id' => 'other_device_2']);
    }

    public function test_cabut_seluruh_sesi_lain_gagal_jika_kata_sandi_salah(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/profile/sessions/revoke-others', [
                'password' => 'kata-sandi-keliru',
            ]);

        $response->assertSessionHasErrors(['password']);
    }

    public function test_pengguna_bisa_menghapus_akun_mandiri_dengan_kata_sandi_benar(): void
    {
        $response = $this->actingAs($this->user)
            ->delete('/profile', [
                'password' => 'password123',
            ]);

        $response->assertRedirect('/');
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('users', [
            'id' => $this->user->id,
        ]);
        $this->assertGuest();
    }

    public function test_penghapusan_akun_mandiri_gagal_jika_kata_sandi_salah(): void
    {
        $response = $this->actingAs($this->user)
            ->delete('/profile', [
                'password' => 'sandi-salah-123',
            ]);

        $response->assertSessionHasErrors(['password']);
        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
        ]);
    }
}

