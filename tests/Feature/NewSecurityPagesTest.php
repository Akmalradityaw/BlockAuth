<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\IpRule;
use App\Models\User;
use App\Models\Webhook;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class NewSecurityPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RbacSeeder::class);
    }

    public function test_guests_cannot_access_security_and_developer_pages(): void
    {
        $this->get('/security/ip-rules')->assertRedirect(route('login'));
        $this->get('/security/sessions')->assertRedirect(route('login'));
        $this->get('/developer/webhooks')->assertRedirect(route('login'));
        $this->get('/announcements')->assertRedirect(route('login'));
    }

    public function test_unauthorized_user_receives_forbidden_response(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Viewer'); // Viewer only has users:read

        $this->actingAs($user)->get('/security/ip-rules')->assertForbidden();
        $this->actingAs($user)->get('/security/sessions')->assertForbidden();
        $this->actingAs($user)->get('/developer/webhooks')->assertForbidden();
        $this->actingAs($user)->get('/announcements')->assertForbidden();
    }

    public function test_admin_can_view_ip_rules_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        IpRule::create([
            'ip_address' => '198.51.100.1',
            'type' => 'blacklist',
            'reason' => 'Port scanning attempt',
            'created_by' => $admin->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get('/security/ip-rules');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Security/IpRules')
            ->has('rules.data', 1)
            ->has('stats')
        );
    }

    public function test_admin_can_view_global_sessions_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        DB::table('sessions')->insert([
            'id' => 'test_session_id_123',
            'user_id' => $admin->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'payload' => serialize(['test' => true]),
            'last_activity' => time(),
        ]);

        $response = $this->actingAs($admin)->get('/security/sessions');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Security/Sessions')
            ->has('sessions.data')
            ->has('stats')
        );
    }

    public function test_admin_can_force_terminate_session(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $targetUser = User::factory()->create();
        DB::table('sessions')->insert([
            'id' => 'session_to_terminate_999',
            'user_id' => $targetUser->id,
            'ip_address' => '192.168.1.100',
            'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            'payload' => serialize(['test' => true]),
            'last_activity' => time(),
        ]);

        $response = $this->actingAs($admin)->delete('/security/sessions/session_to_terminate_999');

        $response->assertRedirect();
        $this->assertDatabaseMissing('sessions', [
            'id' => 'session_to_terminate_999',
        ]);
    }

    public function test_admin_can_view_developer_webhooks_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        Webhook::create([
            'name' => 'Discord Security Notifications',
            'url' => 'https://discord.com/api/webhooks/test',
            'secret' => 'sec_test_secret_123',
            'events' => ['auth.lockout', 'auth.login'],
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get('/developer/webhooks');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Developer/Webhooks')
            ->has('webhooks', 1)
            ->has('stats')
            ->has('availableEvents')
        );
    }

    public function test_admin_can_view_announcements_broadcast_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        Announcement::create([
            'title' => 'Pemberitahuan Pemeliharaan Sistem',
            'content' => 'Server akan diperbarui malam ini pukul 23:00 WIB.',
            'type' => 'warning',
            'is_active' => true,
            'pinned' => true,
            'created_by' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->get('/announcements');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Announcements/Index')
            ->has('announcements.data', 1)
            ->has('stats')
        );
    }
}
