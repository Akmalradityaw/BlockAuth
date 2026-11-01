<?php

namespace Tests\Feature\DataPort;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataPortTest extends TestCase
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
    }

    public function test_guest_tidak_bisa_mengakses_halaman_ekspor_impor_terpadu(): void
    {
        $response = $this->get('/export-import');
        $response->assertRedirect('/login');
    }

    public function test_superadmin_bisa_mengakses_halaman_ekspor_impor_terpadu(): void
    {
        $response = $this->actingAs($this->admin)->get('/export-import');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('DataPort/Index')
            ->has('availableRoles')
            ->has('actionOptions')
            ->has('stats')
            ->where('initialMode', 'export')
            ->where('initialEntity', 'users')
        );
    }

    public function test_pengguna_bisa_mengakses_dengan_parameter_query_khusus(): void
    {
        $response = $this->actingAs($this->admin)->get('/export-import?mode=import&entity=settings');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('DataPort/Index')
            ->where('initialMode', 'import')
            ->where('initialEntity', 'settings')
        );
    }

    public function test_pengguna_bisa_mengakses_dengan_ids_terpilih(): void
    {
        $response = $this->actingAs($this->admin)->get('/export-import?ids=10,20,30');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('DataPort/Index')
            ->where('selectedIds', [10, 20, 30])
        );
    }

    public function test_rute_alias_data_port_mengalihkan_ke_export_import(): void
    {
        $response = $this->actingAs($this->admin)->get('/data-port');
        $response->assertRedirect(route('data-port.index'));
    }
}

