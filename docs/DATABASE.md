# DATABASE - Skema BlockAuth

Koneksi default `sqlite` di `.env.example` (produksi/dev lokal memakai
`mysql` database `blockauth`). Semua kolom non-standar berasal dari migrasi
`2026_01_15_000001`, `2026_09_06_093648` (Spatie), `2026_09_12_000001`,
`2026_09_12_000002`.

## users

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint PK auto | - |
| name | varchar | - |
| email | varchar unique | login + OAuth |
| email_verified_at | timestamp null | syarat middleware verified |
| password | varchar hashed | cast `hashed` di model |
| bio | text null | maks 500 (validasi) |
| avatar_path | varchar null | relatif disk public, misal `avatars/3_1718000000.jpg` |
| provider/token | varchar null | `provider`, `provider_id`, `provider_token` (google/github) |
| remember_token | varchar null | - |
| timestamps | - | created_at dipakai chart pendaftar dan label Bergabung |

Relasi: morph ke roles/permissions via Spatie (`model_has_roles`,
`model_has_permissions`), accessor `avatar_url` (`asset('storage/...')`
atau null), helper `isSuperAdmin()`, `usesSocialLogin()`.

## roles (Spatie + meta proyek)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id, name, guard_name | standar Spatie | 5 baris: SuperAdmin, Manager, Editor, Staff, Viewer |
| label | varchar null | nama tampil Indonesia |
| description | text null | job desk role |
| is_system | boolean default false | true untuk 5 role bawaan, kunci `roles:manage` di UI |

## permissions, role_has_permissions, model_has_roles, model_has_permissions

Standar Spatie. Isi awal dari `RbacSeeder` (idempoten): SuperAdmin memegang
`users:create/read/update/delete`, `roles:manage`, `settings:read/manage`;
Manager CRUD users; Editor tanpa delete; Staff create+read; Viewer read saja.

## settings (file JSON, bukan tabel)

`storage/app/settings.json`, flat key => bool. Contoh:
`{"auth.google": false, "auth.github": false}`. Kunci hilang berarti
default ON. Migrasi `2026_09_13_000001` memindahkan isi tabel lama ke file
lalu drop tabel (rollback mengembalikan keduanya).

## Pendukung

`password_reset_tokens` (email PK, token, created_at), `sessions` (id PK,
user_id index, payload, last_activity index), `cache` dan `jobs` bawaan
Laravel. Avatar fisik di `storage/app/public/avatars` (butuh
`storage:link`).
