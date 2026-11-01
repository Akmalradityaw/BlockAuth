<?php

namespace Tests\Feature\Audit;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogExportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\RbacSeeder::class);

        $this->admin = User::factory()->create(['email_verified_at' => now()]);
        $this->admin->assignRole('SuperAdmin');

        AuditLog::record('auth:login', 'Percobaan login', [], $this->admin);
        AuditLog::record('settings:update', 'Pembaruan pengaturan', [], $this->admin);
    }

    public function test_superadmin_bisa_ekspor_audit_log_csv_dan_json(): void
    {
        // CSV
        $resCsv = $this->actingAs($this->admin)->get('/audit-logs/export?format=csv');
        $resCsv->assertOk();
        $this->assertStringContainsString('audit-logs-', $resCsv->headers->get('content-disposition'));

        // JSON
        $resJson = $this->actingAs($this->admin)->get('/audit-logs/export?format=json');
        $resJson->assertOk();
        $jsonContent = $resJson->streamedContent();
        $this->assertStringContainsString('auth:login', $jsonContent);

        // Memastikan aktivitas ekspor audit log tercatat
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'audit_logs:export',
        ]);
    }

    public function test_superadmin_dialihkan_ke_halaman_pusat_ekspor_impor(): void
    {
        $response = $this->actingAs($this->admin)->get('/audit-logs/export');
        $response->assertRedirect('/export-import?entity=audit&mode=export');
    }
}

