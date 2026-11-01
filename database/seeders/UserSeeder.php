<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Rentang tanggal pembuatan akun demo.
     */
    private const START_DATE = '2026-09-01 00:00:00';
    private const END_DATE   = '2026-09-12 23:59:59';

    public function run(): void
    {
        $start = Carbon::parse(self::START_DATE);
        $end   = Carbon::parse(self::END_DATE);
        $totalDays = $start->diffInDays($end); // 354 hari

        // ==========================================================
        // 1. Akun demo tetap (4 akun) — tanggal tersebar merata
        //    di rentang 23-09-2025 s/d 12-09-2026.
        // ==========================================================
        $demos = [
            ['Budi Santoso', 'manager.demo@gmail.com', 'Manager', 'Memimpin operasional harian tim.'],
            ['Siti Rahayu',  'editor.demo@gmail.com',  'Editor',  'Spesialis konten dan kurasi data.'],
            ['Agus Wijaya',  'staff.demo@gmail.com',   'Staff',   'Operator input data harian.'],
            ['Dewi Lestari', 'viewer.demo@gmail.com',  'Viewer',  'Auditor laporan dan data.'],
        ];

        // Posisi relatif (0..1) untuk tiap akun demo di sepanjang rentang.
        $demoOffsets = [0.0, 0.33, 0.66, 1.0];

        foreach ($demos as $i => [$name, $email, $role, $bio]) {
            $dayOffset = (int) round($totalDays * $demoOffsets[$i]);
            $createdAt = $start->copy()->addDays($dayOffset)->setTime(9, 0, 0);

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'email_verified_at' => $createdAt,
                    'bio' => $bio,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]
            );

            // Paksa update tanggal bila seeder dijalankan ulang.
            if (! $user->wasRecentlyCreated) {
                $user->forceFill([
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                    'email_verified_at' => $createdAt,
                ])->saveQuietly();
            }

            $user->syncRoles([$role]);
        }

        // ==========================================================
        // 2. Akun random — jumlah tetap, tanggal tersebar merata
        //    di seluruh rentang (bukan acak bebas).
        // ==========================================================
        $randomCount = 90;

        // Bagi rentang jadi $randomCount slot, tiap user dapat 1 slot.
        // Sisipkan sedikit jitter (< 1 hari) agar tidak monoton.
        $slotSize = $totalDays / $randomCount;

        for ($i = 0; $i < $randomCount; $i++) {
            $dayOffset = (int) round($i * $slotSize);
            $createdAt = $start->copy()
                ->addDays($dayOffset)
                ->addHours(random_int(8, 20))
                ->addMinutes(random_int(0, 59));

            // Jaga agar tidak melewati END_DATE.
            if ($createdAt->greaterThan($end)) {
                $createdAt = $end->copy()->subMinutes(random_int(0, 59));
            }

            $user = User::factory()->create();

            $user->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
                'email_verified_at' => $createdAt,
            ])->saveQuietly();

            $user->syncRoles(['Staff']);
        }
    }
}
