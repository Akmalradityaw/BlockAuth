<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use App\Support\TwoFactorAuthenticator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
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

    public function test_pengguna_biasa_tanpa_2fa_bisa_login_langsung_ke_dashboard(): void
    {
        $response = $this->post('/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($this->user);
    }

    public function test_pengguna_bisa_mengambil_setup_data_2fa(): void
    {
        $response = $this->actingAs($this->user)->getJson('/two-factor/setup');

        $response->assertOk();
        $response->assertJsonStructure([
            'enabled',
            'secret',
            'qr_code_url',
            'otpauth_url',
        ]);
        $this->assertFalse($response->json('enabled'));
    }

    public function test_pengguna_bisa_mengonfirmasi_dan_mengaktifkan_2fa(): void
    {
        $secret = TwoFactorAuthenticator::generateSecretKey(32);
        $timeSlice = (int) floor(time() / 30);
        $validCode = TwoFactorAuthenticator::calculateCode($secret, $timeSlice);

        $response = $this->actingAs($this->user)
            ->withSession(['two_factor_setup_secret' => $secret])
            ->post('/two-factor/confirm', [
                'code' => $validCode,
            ]);

        $response->assertSessionHas('success');
        $response->assertSessionHas('recovery_codes');

        $this->user->refresh();
        $this->assertTrue($this->user->hasTwoFactorEnabled());
        $this->assertEquals($secret, $this->user->two_factor_secret);
        $this->assertCount(8, $this->user->two_factor_recovery_codes);
    }

    public function test_konfirmasi_2fa_gagal_jika_kode_salah(): void
    {
        $secret = TwoFactorAuthenticator::generateSecretKey(32);

        $response = $this->actingAs($this->user)
            ->withSession(['two_factor_setup_secret' => $secret])
            ->post('/two-factor/confirm', [
                'code' => '000000',
            ]);

        $response->assertSessionHasErrors(['code']);
        $this->user->refresh();
        $this->assertFalse($this->user->hasTwoFactorEnabled());
    }

    public function test_pengguna_bisa_melihat_kode_pemulihan_dengan_kata_sandi_benar(): void
    {
        $codes = TwoFactorAuthenticator::generateRecoveryCodes(8);
        $this->user->update([
            'two_factor_secret' => 'DUMMYSECRET',
            'two_factor_recovery_codes' => $codes,
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->postJson('/two-factor/recovery-codes', [
            'password' => 'password123',
        ]);

        $response->assertOk();
        $response->assertJson([
            'recovery_codes' => $codes,
        ]);
    }

    public function test_pengguna_bisa_membuat_ulang_kode_pemulihan(): void
    {
        $this->user->update([
            'two_factor_secret' => 'DUMMYSECRET',
            'two_factor_recovery_codes' => ['OLD1', 'OLD2'],
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->post('/two-factor/recovery-codes/regenerate', [
            'password' => 'password123',
        ]);

        $response->assertSessionHas('success');
        $this->user->refresh();
        $this->assertCount(8, $this->user->two_factor_recovery_codes);
        $this->assertNotEquals(['OLD1', 'OLD2'], $this->user->two_factor_recovery_codes);
    }

    public function test_pengguna_bisa_menonaktifkan_2fa(): void
    {
        $this->user->update([
            'two_factor_secret' => 'DUMMYSECRET',
            'two_factor_recovery_codes' => ['CODE1'],
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->delete('/two-factor', [
            'password' => 'password123',
        ]);

        $response->assertSessionHas('success');
        $this->user->refresh();
        $this->assertFalse($this->user->hasTwoFactorEnabled());
        $this->assertNull($this->user->two_factor_secret);
        $this->assertNull($this->user->two_factor_recovery_codes);
    }

    public function test_login_dengan_2fa_aktif_mengarahkan_ke_layar_tantangan(): void
    {
        $this->user->update([
            'two_factor_secret' => 'DUMMYSECRET',
            'two_factor_recovery_codes' => ['CODE1'],
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->post('/login', [
            'email' => $this->user->email,
            'password' => 'password123',
        ]);

        $response->assertRedirect('/two-factor-challenge');
        $this->assertGuest();
        $response->assertSessionHas('login.2fa.user_id', $this->user->id);
    }

    public function test_verifikasi_2fa_challenge_dengan_kode_totp_berhasil(): void
    {
        $secret = TwoFactorAuthenticator::generateSecretKey(32);
        $timeSlice = (int) floor(time() / 30);
        $validCode = TwoFactorAuthenticator::calculateCode($secret, $timeSlice);

        $this->user->update([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => ['REC-1111'],
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->withSession(['login.2fa.user_id' => $this->user->id])
            ->post('/two-factor-challenge', [
                'code' => $validCode,
            ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($this->user);
    }

    public function test_verifikasi_2fa_challenge_dengan_recovery_code_berhasil_dan_menghanguskan_kode(): void
    {
        $this->user->update([
            'two_factor_secret' => 'SECRET',
            'two_factor_recovery_codes' => ['REC-1111', 'REC-2222'],
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->withSession(['login.2fa.user_id' => $this->user->id])
            ->post('/two-factor-challenge', [
                'recovery_code' => 'rec-1111',
            ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($this->user);

        $this->user->refresh();
        $this->assertCount(1, $this->user->two_factor_recovery_codes);
        $this->assertEquals(['REC-2222'], $this->user->two_factor_recovery_codes);
    }
}

