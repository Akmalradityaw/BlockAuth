<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\MagicLinkNotification;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class MagicLinkTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);
    }

    public function test_halaman_magic_link_bisa_dibuka(): void
    {
        $this->get(route('magic-link.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Auth/MagicLink'));
    }

    public function test_permintaan_magic_link_mengirimkan_notifikasi_email(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'member@example.com']);

        $response = $this->post(route('magic-link.store'), [
            'email' => 'member@example.com',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('status');

        Notification::assertSentTo($user, MagicLinkNotification::class);
    }

    public function test_klik_tautan_magic_link_menampilkan_layar_konfirmasi_dua_tahap(): void
    {
        $user = User::factory()->create();

        $signedUrl = URL::temporarySignedRoute(
            'magic-link.verify',
            now()->addMinutes(15),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())]
        );

        $response = $this->get($signedUrl);

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Auth/MagicLinkConfirm')
                ->where('targetUser.email', $user->email)
            );
    }

    public function test_konfirmasi_magic_link_berhasil_masuk_ke_dashboard(): void
    {
        $user = User::factory()->create();

        $signedUrl = URL::temporarySignedRoute(
            'magic-link.consume',
            now()->addMinutes(15),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())]
        );

        $response = $this->post($signedUrl);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'auth:login_magic_link',
            'user_id' => $user->id,
        ]);
    }

    public function test_magic_link_dengan_signature_rusak_atau_kedaluwarsa_ditolak(): void
    {
        $user = User::factory()->create();

        $invalidUrl = route('magic-link.verify', [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
            'signature' => 'invalid_hash_signature',
        ]);

        $this->get($invalidUrl)
            ->assertRedirect(route('login'))
            ->assertSessionHas('warning');
    }
}

