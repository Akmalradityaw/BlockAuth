<?php

namespace Tests\Feature\User;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class UserMultiFormatImportTest extends TestCase
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
    }

    public function test_superadmin_bisa_unduh_template_impor(): void
    {
        $response = $this->actingAs($this->admin)->get('/users/import/template?format=csv');
        $response->assertOk();
        $this->assertStringContainsString('template_pengguna.csv', $response->headers->get('content-disposition'));
    }

    public function test_impor_pengguna_dari_csv_berhasil(): void
    {
        $csvContent = "name,email,role,password\n"
            . "User Satu,usersatu@example.com,Staff,secret123\n"
            . "User Dua,userdua@example.com,Editor,\n";

        $file = UploadedFile::fake()->createWithContent('users.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post('/users/import', ['file' => $file]);
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', ['email' => 'usersatu@example.com']);
        $this->assertDatabaseHas('users', ['email' => 'userdua@example.com']);

        $u1 = User::where('email', 'usersatu@example.com')->first();
        $this->assertTrue($u1->hasRole('Staff'));
    }

    public function test_impor_csv_regional_indonesia_titik_koma(): void
    {
        $csvContent = "name;email;role;password\n"
            . "User Indo;userindo@example.com;Viewer;secret123\n";

        $file = UploadedFile::fake()->createWithContent('users_indo.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post('/users/import', ['file' => $file]);
        $response->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'userindo@example.com']);
    }

    public function test_impor_dari_json_berhasil(): void
    {
        $jsonContent = json_encode([
            ['name' => 'JSON User', 'email' => 'jsonuser@example.com', 'role' => 'Editor'],
        ]);

        $file = UploadedFile::fake()->createWithContent('users.json', $jsonContent);

        $response = $this->actingAs($this->admin)->post('/users/import', ['file' => $file]);
        $response->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'jsonuser@example.com']);
    }

    public function test_impor_dari_markdown_berhasil(): void
    {
        $mdContent = "| name | email | role |\n|---|---|---|\n| MD User | mduser@example.com | Staff |\n";

        $file = UploadedFile::fake()->createWithContent('users.md', $mdContent);

        $response = $this->actingAs($this->admin)->post('/users/import', ['file' => $file]);
        $response->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'mduser@example.com']);
    }

    public function test_impor_sql_insert_berhasil(): void
    {
        $sqlContent = "INSERT INTO `users` (`name`, `email`, `role`) VALUES ('SQL User', 'sqluser@example.com', 'Staff');";

        $file = UploadedFile::fake()->createWithContent('users.sql', $sqlContent);

        $response = $this->actingAs($this->admin)->post('/users/import', ['file' => $file]);
        $response->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'sqluser@example.com']);
    }

    public function test_impor_sql_dengan_instruksi_berbahaya_otomatis_ditolak(): void
    {
        $badSql = "DROP TABLE users;\nINSERT INTO `users` (`name`, `email`) VALUES ('Hacker', 'hack@example.com');";

        $file = UploadedFile::fake()->createWithContent('exploit.sql', $badSql);

        $this->expectException(\InvalidArgumentException::class);
        $action = app(\App\Actions\User\ImportUsersAction::class);
        $action->execute($file, $this->admin);
    }
}

