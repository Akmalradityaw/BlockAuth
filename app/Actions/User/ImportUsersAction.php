<?php

namespace App\Actions\User;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use App\Support\DataPort\DataImporterManager;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

class ImportUsersAction
{
    public function execute(UploadedFile $file, User $actor): array
    {
        $rows = DataImporterManager::parseFile($file->getPathname(), $file->getClientOriginalExtension());
        
        $availableRoles = Role::pluck('name')->all();
        $isSuperAdmin = $actor->hasRole('SuperAdmin');
        $defaultPasswordHash = Hash::make(Str::random(16));

        $imported = 0;
        $skipped = 0;
        $errors = [];
        $existingEmails = array_flip(User::pluck('email')->map(fn ($e) => strtolower($e))->all());
        $seenInFile = [];

        DB::beginTransaction();
        try {
            foreach ($rows as $index => $row) {
                if ($index >= 500) {
                    $errors[] = "Batas maksimal 500 baris per file tercapai. Baris selebihnya dilewati.";
                    break;
                }

                $rowNum = $index + 2; // Baris 1 adalah header
                $name = trim($row['nama'] ?? $row['name'] ?? '');
                $email = strtolower(trim($row['email'] ?? ''));
                $roleName = trim($row['peran'] ?? $row['role'] ?? '');
                $password = trim($row['password'] ?? $row['kata_sandi'] ?? '');

                if ($name === '' || $email === '') {
                    $skipped++;
                    $errors[] = "Baris {$rowNum}: Nama dan email wajib diisi.";
                    continue;
                }

                if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $skipped++;
                    $errors[] = "Baris {$rowNum}: Format email '{$email}' tidak valid.";
                    continue;
                }

                if (isset($existingEmails[$email]) || isset($seenInFile[$email])) {
                    $skipped++;
                    $errors[] = "Baris {$rowNum}: Email '{$email}' sudah terdaftar.";
                    continue;
                }
                $seenInFile[$email] = true;

                // Proteksi Role & Fallback ke Viewer
                $targetRole = 'Viewer';
                if ($roleName !== '' && in_array($roleName, $availableRoles, true)) {
                    if ($roleName === 'SuperAdmin' && ! $isSuperAdmin) {
                        $targetRole = 'Viewer';
                        $errors[] = "Baris {$rowNum}: Akses ditolak untuk menetapkan SuperAdmin, dialihkan ke Viewer.";
                    } else {
                        $targetRole = $roleName;
                    }
                }

                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => $password !== '' ? Hash::make($password) : $defaultPasswordHash,
                    'email_verified_at' => now(),
                ]);

                $user->assignRole($targetRole);
                $existingEmails[$email] = true;
                $imported++;
            }

            DB::commit();
            app(PermissionRegistrar::class)->forgetCachedPermissions();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        AuditLog::record('users:import', "Mengimpor {$imported} pengguna dari berkas {$file->getClientOriginalName()}", [
            'imported_count' => $imported,
            'skipped_count' => $skipped,
            'file_name' => $file->getClientOriginalName(),
        ]);

        return [
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }
}

