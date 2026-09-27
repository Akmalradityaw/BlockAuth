<?php

namespace Tests\Feature;

use App\Models\AccessPolicy;
use App\Models\EmailTemplate;
use App\Models\OAuthClient;
use App\Models\Organization;
use App\Models\SecurityTicket;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ExtendedFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RbacSeeder::class);
    }

    public function test_admin_can_view_and_create_organization(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->get('/organizations');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page->component('Organizations/Index'));

        $createResponse = $this->actingAs($admin)->post('/organizations', [
            'name' => 'Fintech Security Division',
            'slug' => 'fintech-security',
            'description' => 'Unit divisi tata kelola siber keuangan.',
            'max_members' => 30,
            'is_active' => true,
        ]);

        $createResponse->assertRedirect();
        $this->assertDatabaseHas('organizations', [
            'slug' => 'fintech-security',
        ]);
        $this->assertDatabaseHas('organization_members', [
            'user_id' => $admin->id,
            'role' => 'owner',
        ]);
    }

    public function test_admin_can_add_member_to_organization(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $memberUser = User::factory()->create();

        $org = Organization::create([
            'name' => 'Cloud Ops',
            'slug' => 'cloud-ops',
            'owner_id' => $admin->id,
            'max_members' => 20,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post("/organizations/{$org->id}/members", [
            'user_id' => $memberUser->id,
            'role' => 'admin',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('organization_members', [
            'organization_id' => $org->id,
            'user_id' => $memberUser->id,
            'role' => 'admin',
        ]);
    }

    public function test_admin_can_manage_oauth_client_apps(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->get('/developer/oauth-clients');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page->component('Developer/OAuthClients'));

        $createResponse = $this->actingAs($admin)->post('/developer/oauth-clients', [
            'name' => 'Internal HR Mobile Portal',
            'redirect_uri' => 'https://hr.company.internal/oauth/callback',
            'scopes' => ['profile', 'email'],
        ]);

        $createResponse->assertRedirect();
        $client = OAuthClient::where('name', 'Internal HR Mobile Portal')->first();
        $this->assertNotNull($client);
        $this->assertStringStartsWith('ba_client_', $client->client_id);
        $this->assertStringStartsWith('ba_sec_', $client->client_secret);

        // Regenerate secret
        $oldSecret = $client->client_secret;
        $regenResponse = $this->actingAs($admin)->post("/developer/oauth-clients/{$client->id}/regenerate-secret");
        $regenResponse->assertRedirect();
        $client->refresh();
        $this->assertNotEquals($oldSecret, $client->client_secret);
    }

    public function test_users_can_create_ticket_and_reply(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $user = User::factory()->create();
        $user->assignRole('Staff');

        $createResponse = $this->actingAs($user)->post('/security/tickets', [
            'subject' => 'Kendala OTP 2FA Tidak Muncul',
            'category' => '2fa_reset',
            'priority' => 'high',
            'description' => 'Aplikasi authenticator tidak menghasilkan kode verifikasi yang valid.',
        ]);

        $createResponse->assertRedirect();
        $ticket = SecurityTicket::where('subject', 'Kendala OTP 2FA Tidak Muncul')->first();
        $this->assertNotNull($ticket);
        $this->assertStringStartsWith('SEC-', $ticket->ticket_number);

        // Reply to ticket
        $replyResponse = $this->actingAs($admin)->post("/security/tickets/{$ticket->id}/reply", [
            'message' => 'Silakan sinkronkan jam perangkat Anda di pengaturan Android/iOS.',
            'is_internal' => false,
        ]);

        $replyResponse->assertRedirect();
        $this->assertDatabaseHas('ticket_replies', [
            'ticket_id' => $ticket->id,
            'user_id' => $admin->id,
        ]);
    }

    public function test_admin_can_manage_access_policies(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->get('/security/policies');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page->component('Security/Policies'));

        $createResponse = $this->actingAs($admin)->post('/security/policies', [
            'name' => 'Geofencing Pemblokiran Wilayah Gelap',
            'type' => 'geofencing',
            'action' => 'block',
            'description' => 'Blokir percobaan masuk dari negara yang tidak terdaftar.',
            'rules' => ['blocked_countries' => ['RU', 'CN']],
        ]);

        $createResponse->assertRedirect();
        $this->assertDatabaseHas('access_policies', [
            'name' => 'Geofencing Pemblokiran Wilayah Gelap',
            'type' => 'geofencing',
            'action' => 'block',
        ]);
    }

    public function test_admin_can_manage_email_templates(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $template = EmailTemplate::create([
            'code' => 'test_verification',
            'name' => 'Test Email Verification',
            'subject' => 'Verifikasi Akun BlockAuth Anda',
            'body' => 'Halo {{user_name}}, silakan klik {{action_url}}.',
            'variables' => ['user_name', 'action_url'],
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get('/settings/email-templates');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page->component('Settings/EmailTemplates'));

        $updateResponse = $this->actingAs($admin)->put("/settings/email-templates/{$template->id}", [
            'subject' => 'Subjek Baru Terverifikasi',
            'body' => 'Konten email baru dengan {{user_name}}.',
        ]);

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('email_templates', [
            'id' => $template->id,
            'subject' => 'Subjek Baru Terverifikasi',
        ]);
    }
}
