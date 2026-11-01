<?php

namespace Tests\Feature\Settings;

use App\Models\Setting;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MailSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('SuperAdmin');

        $this->regularUser = User::factory()->create();
        $this->regularUser->assignRole('Viewer');
    }

    public function test_superadmin_bisa_memperbarui_konfigurasi_smtp(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->put(route('settings.mail.update'), [
                'host' => 'smtp.mailgun.org',
                'port' => 587,
                'encryption' => 'tls',
                'username' => 'postmaster@mg.example.com',
                'password' => 'secret_password_123',
                'from_address' => 'noreply@example.com',
                'from_name' => 'BlockAuth System',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals('smtp.mailgun.org', Setting::get('mail.host'));
        $this->assertEquals(587, Setting::get('mail.port'));
        $this->assertEquals('secret_password_123', Setting::getEncrypted('mail.password'));

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'settings:mail_updated',
        ]);
    }

    public function test_pengguna_biasa_ditolak_mengubah_pengaturan_smtp(): void
    {
        $this->actingAs($this->regularUser)
            ->put(route('settings.mail.update'), [
                'host' => 'smtp.mailgun.org',
                'port' => 587,
                'encryption' => 'tls',
                'from_address' => 'noreply@example.com',
                'from_name' => 'BlockAuth System',
            ])
            ->assertForbidden();
    }

    public function test_superadmin_bisa_mengirim_email_uji_coba(): void
    {
        Mail::fake();

        $response = $this->actingAs($this->superAdmin)
            ->post(route('settings.mail.test'), [
                'email' => 'admin@example.com',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }
}

