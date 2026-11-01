<?php

namespace Tests\Feature\Audit;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuditLogTest extends TestCase
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
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $this->admin->assignRole('SuperAdmin');

        $this->viewer = User::factory()->create([
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $this->viewer->assignRole('Viewer');
    }

    public function test_superadmin_bisa_melihat_halaman_log_audit(): void
    {
        AuditLog::record('auth:login', 'Percobaan masuk berhasil', ['test' => true], $this->admin);

        $response = $this->actingAs($this->admin)->get('/audit-logs');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AuditLogs/Index')
            ->has('logs.data')
            ->has('stats')
            ->has('filters')
        );
    }

    public function test_pengguna_biasa_tanpa_izin_ditolak_mengakses_log_audit(): void
    {
        $response = $this->actingAs($this->viewer)->get('/audit-logs');

        $response->assertForbidden();
    }

    public function test_filter_berdasarkan_aksi_dan_pencarian_berfungsi(): void
    {
        AuditLog::record('settings:update', 'Mengubah pengaturan sistem', ['key' => 'auth.google'], $this->admin);
        AuditLog::record('auth:login', 'Pengguna masuk', null, $this->viewer);

        $response = $this->actingAs($this->admin)->get('/audit-logs?action=settings:update');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AuditLogs/Index')
            ->where('logs.data.0.action', 'settings:update')
        );
    }

    public function test_login_berhasil_merekam_audit_log(): void
    {
        $this->post('/login', [
            'email' => $this->viewer->email,
            'password' => 'password123',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'auth:login',
            'user_id' => $this->viewer->id,
        ]);
    }

    public function test_login_gagal_merekam_audit_log(): void
    {
        $this->post('/login', [
            'email' => $this->viewer->email,
            'password' => 'sandi-yang-salah',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'auth:failed',
        ]);
    }

    public function test_logout_merekam_audit_log(): void
    {
        $this->actingAs($this->viewer)->post('/logout');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'auth:logout',
            'user_id' => $this->viewer->id,
        ]);
    }
}

