<?php

namespace Tests\Feature\User;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserMultiFormatExportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $targetUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\RbacSeeder::class);

        $this->admin = User::factory()->create(['email_verified_at' => now()]);
        $this->admin->assignRole('SuperAdmin');

        $this->targetUser = User::factory()->create([
            'name' => '=SUM(1+1) Danger',
            'email' => 'target@example.com',
            'email_verified_at' => now(),
        ]);
        $this->targetUser->assignRole('Staff');
    }

    public function test_superadmin_bisa_ekspor_seluruh_9_format(): void
    {
        $formats = ['csv', 'xlsx', 'pdf', 'docx', 'json', 'sql', 'md', 'html', 'txt'];

        foreach ($formats as $fmt) {
            $response = $this->actingAs($this->admin)->get("/users/export?format={$fmt}");
            $response->assertOk();
            $this->assertNotNull($response->headers->get('content-disposition'));
        }
    }

    public function test_ekspor_csv_dan_txt_menetralisir_formula_injection(): void
    {
        // CSV
        $response = $this->actingAs($this->admin)->get('/users/export?format=csv');
        $response->assertOk();
        $content = $response->streamedContent();
        $this->assertStringContainsString("'=SUM(1+1) Danger", $content);

        // TXT
        $txtResponse = $this->actingAs($this->admin)->get('/users/export?format=txt');
        $txtResponse->assertOk();
        $txtContent = $txtResponse->streamedContent();
        $this->assertStringContainsString("'=SUM(1+1) Danger", $txtContent);
    }

    public function test_ekspor_menghormati_filter_role(): void
    {
        $response = $this->actingAs($this->admin)->get('/users/export?format=json&role=Staff');
        $response->assertOk();
        $content = $response->streamedContent();

        $this->assertStringContainsString('target@example.com', $content);
        $this->assertStringNotContainsString($this->admin->email, $content);
    }

    public function test_superadmin_dialihkan_ke_halaman_pusat_ekspor_impor(): void
    {
        $response = $this->actingAs($this->admin)->get('/users/export');
        $response->assertRedirect('/export-import?entity=users&mode=export');
    }
}
