<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class RouteHealthCheckTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RbacSeeder::class);
    }

    public function test_all_routes_for_superadmin(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $routes = [
            '/',
            '/dashboard',
            '/users',
            '/organizations',
            '/roles/permissions',
            '/settings',
            '/settings/email-templates',
            '/security/ip-rules',
            '/security/sessions',
            '/security/tickets',
            '/security/policies',
            '/developer/oauth-clients',
            '/developer/webhooks',
            '/announcements',
            '/audit-logs',
            '/profile',
            '/privacy',
            '/terms',
        ];

        foreach ($routes as $url) {
            $response = $this->actingAs($admin)->get($url);
            $response->assertStatus(200);
        }
    }

    public function test_custom_404_error_page_renders_with_inertia(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->get('/halaman-yang-tidak-ada-sama-sekali');
        $response->assertStatus(404);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 404)
        );
    }

    public function test_custom_403_error_page_renders_when_unauthorized(): void
    {
        $viewer = User::factory()->create();
        $viewer->assignRole('Viewer');

        $response = $this->actingAs($viewer)->get('/settings');
        $response->assertStatus(403);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }
}
