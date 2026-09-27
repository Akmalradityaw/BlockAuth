# BlockAuth `v2.1.3`

Modul autentikasi dan manajemen profil user untuk Laravel: registrasi dan login
session, reset password via email, login sosial Google dan GitHub, edit data diri
dan avatar, plus direktori pengguna berbasis role. Frontend memakai Inertia.js +
React dengan layout responsif penuh (1 kolom di HP, multi kolom di tablet dan
desktop) dan design system warna solid indigo, violet, dan amber tanpa gradien.

Dokumentasi pendukung: `PRD.md` (spesifikasi produk), `RULES.md` (aturan arsitektur),
`DESIGN.md` (design system). Semua file kode dibatasi maksimal 300 baris.

---

## 1. Versi

| Komponen | Versi | Keterangan |
|---|---|---|
| BlockAuth (aplikasi) | `2.1.3` | Login Username, Switch Role Instan, Dashboard Interaktif |
| `PRD.md` | `1.0` | Spesifikasi produk, 2026-01-15 |
| `RULES.md` | `2.0` | Aturan arsitektur dan palet v2 |
| `DESIGN.md` | `2.0` | Design system indigo, violet, amber |
| Laravel Framework | `12.69.1` | Terinstal, syarat `^12.0` |
| PHP | `8.2.12` | Lingkungan saat ini, syarat `^8.2` |
| Inertia Laravel | `2.0.26` | Adapter server, syarat `^2.0` |
| Inertia React | `^2.0.0` | Adapter client |
| React | `^18.3.1` | Library UI |
| Tailwind CSS | `^3.4.15` | Utility CSS |
| daisyUI | `^4.12.14` | Komponen UI, tema kustom `blockauth` |
| Vite | `6.4.3` | Build tool |
| Socialite | `5.31.0` | OAuth Google dan GitHub |
| Spatie Permission | `6.25.0` | RBAC `SuperAdmin` dan `User` |
| Intervention Image | `1.5.9` | Resize dan crop avatar |
| Telescope | `5.23.0` | Monitoring dev |
| Debugbar | `3.16.5` | Debugging dev |
| Sanctum | `4.3.3` | API auth bawaan Laravel |
| Ziggy | `2.6.4` | Helper rute Laravel di JS |

Riwayat singkat:

- `v1.0`: rilis awal. Palet teal dalam, biru kobalt, dan abu charcoal.
- `v2.0`: ganti palet ke indigo, violet, dan amber. Tambah tipografi responsif
  (Inter + Plus Jakarta Sans), navbar dengan status aktif dan menu mobile,
  layout auth split 2 kolom, halaman Data Pengguna dengan paginasi, serta
  seeder 12 user contoh.

---

## 2. Fitur

### Autentikasi

- Registrasi akun dengan validasi, otomatis diberi role `User` via Spatie.
- Login dan logout berbasis session, dengan opsi ingat saya.
- Lupa password dan reset password melalui link email.
- Login sosial Google dan GitHub via Laravel Socialite, dengan tautan otomatis
  ke akun yang memakai email yang sama.

### Profil

- Edit data diri: nama, email, bio (maks 500 karakter).
- Upload avatar: file JPG, PNG, atau WEBP maks 2MB, otomatis di-resize dan
  di-crop ke 300x300 px, disimpan di disk `public` (`storage/app/public/avatars`).
- Update password dengan verifikasi password saat ini.

### Direktori pengguna dan dashboard

- Dashboard: statistik total pengguna, terverifikasi, dan SuperAdmin, plus
  5 pengguna terbaru.
- Halaman Data Pengguna (`/users`, khusus SuperAdmin): statistik, kartu
  di layar HP, tabel di layar desktop, paginasi 10 per halaman.
- Otorisasi via Policy: profil hanya bisa diubah pemiliknya atau SuperAdmin.

---

## 3. Tech stack

Peran tiap package (versi pasti ada di bagian 1. Versi):

| Lapisan | Teknologi |
|---|---|
| Backend | Laravel 12, PHP ^8.2 |
| Frontend | Inertia.js 2 + React 18 |
| Styling | Tailwind CSS v3 + daisyUI 4, tema kustom `blockauth` |
| Tipografi | Inter (body), Plus Jakarta Sans (display dan H1) via Google Fonts |
| Auth sosial | Socialite: OAuth Google dan GitHub dengan tautan akun otomatis |
| RBAC | Spatie Permission: role `SuperAdmin` dan `User` |
| Gambar | Intervention Image: resize dan crop avatar ke 300x300 px |
| Debug dev | Telescope dan Debugbar, aktif di lingkungan lokal saja |

---

## 4. Design system v2

Warna solid saja, tanpa gradien. Detail lengkap ada di `DESIGN.md`.

| Token | Hex | Penggunaan |
|---|---|---|
| Indigo Ink | `#1E1B4B` | Navbar, footer, panel brand, teks judul |
| Violet Punch | `#6D28D9` | Tombol utama, link aktif, fokus input, progres Inertia. Hover `#5B21B6` |
| Amber Pop | `#F59E0B` | CTA alternatif, badge SuperAdmin |
| Slate Line | `#334155` | Teks sekunder, border, divider |
| Paper / Mist | `#F8FAFC` / `#EEF2FF` | Background halaman / panel lembut |
| Putih | `#FFFFFF` | Background kartu, teks di atas warna gelap |

Aturan visual:

- Dilarang memakai CSS gradient (`bg-gradient-*`).
- Dilarang memakai em-dash atau en-dash pada teks UI dan komentar kode.
- Skala tipe responsif: Display 28-40px/800, H1 22-28px/700, H2 20px/600,
  Body 16px/1.6, Small 14px, Caption 12px uppercase.
- Layout responsif: 1 kolom di HP, multi kolom di `sm` dan `lg`. Auth memakai
  split 2 kolom di `lg` (panel brand + form). Tabel Users menjadi kartu di HP.

---

## 5. Arsitektur

Prinsip SOLID dan clean code sesuai `RULES.md`:

- **Action Classes** (`app/Actions/Auth`, `app/Actions/Profile`): seluruh logika
  bisnis. Controller hanya validasi ringan, panggil Action, lalu redirect.
- **Form Requests** (`app/Http/Requests`): semua validasi input.
- **DTO** (`app/DataTransferObjects`): `RegisterData`, `UpdateProfileData`,
  `SocialiteData` untuk passing data kompleks antar lapisan.
- **Policy** (`app/Policies/UserPolicy.php`): `viewAny` khusus SuperAdmin,
  `update` dan `view` untuk pemilik akun atau SuperAdmin.
- **Batas keras**: maksimal 300 baris per file. Jika mendekati batas, pecah
  menjadi sub-komponen atau sub-service.

Struktur penting:

```
app/
  Actions/Auth          RegisterUserAction, AuthenticateUserAction, HandleSocialiteCallbackAction
  Actions/Profile       UpdateUserProfileTextAction, UploadUserAvatarAction, UpdateUserPasswordAction
  DataTransferObjects   RegisterData, UpdateProfileData, SocialiteData
  Http/Controllers      DashboardController, UserController, ProfileController,
                        AvatarController, PasswordController, Auth/*
  Http/Middleware       HandleInertiaRequests (share auth.user, auth.roles, flash)
  Http/Requests         RegisterRequest, LoginRequest, UpdateProfileRequest,
                        AvatarUploadRequest, UpdatePasswordRequest
  Models/User.php       HasRoles, avatar_url accessor, isSuperAdmin()
  Policies/UserPolicy.php
resources/js/
  Components            FormInput, SolidButton, Navbar, AvatarUploader, Ui (RoleBadge, StatCard, SectionTitle)
  Layouts               AppLayout, AuthLayout
  Pages/Auth            Login, Register, ForgotPassword, ResetPassword
  Pages                 Welcome, Dashboard, Profile/Edit (+ Partials), Users/Index
routes/
  web.php               home, dashboard, users, profile, avatar, password
  auth.php              register, login, logout, forgot/reset password, oauth redirect/callback
database/
  migrations            users + kolom BlockAuth (bio, avatar_path, provider*) + permission tables
  seeders               RoleSeeder (role + admin), UserSeeder (12 user contoh)
```

---

## 6. Instalasi

Kebutuhan: PHP ^8.2 dengan ekstensi standar Laravel, Composer, Node 20+,
MySQL atau SQLite, dan kredensial OAuth jika ingin mencoba login sosial.

```powershell
composer install
npm install

Copy-Item .env.example .env
php artisan key:generate

# Spatie permission (wajib sekali, sebelum migrate)
php artisan vendor:publish --provider='Spatie\Permission\PermissionServiceProvider'

php artisan migrate --seed
php artisan storage:link

npm run dev
# atau: composer dev          (serve + queue + log + vite)
# atau: composer dev:lite     (serve + vite saja)
```

Build produksi:

```powershell
npm run build
```

---

## 7. Konfigurasi `.env`

```ini
APP_NAME=BlockAuth
FILESYSTEM_DISK=public

# OAuth Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="${APP_URL}/oauth/google/callback"

# OAuth GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI="${APP_URL}/oauth/github/callback"

# Email reset password (contoh dev: log, produksi: smtp)
MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@example.com"
```

Catatan:

- Tanpa kredensial OAuth, tombol Google dan GitHub akan error dari provider.
  Registrasi dan login email tetap berfungsi normal.
- Reset password memakai driver mail yang aktif. Untuk dev, `log` cukup
  (link reset tercatat di `storage/logs/laravel.log`).
- Avatar butuh `php artisan storage:link` agar `avatar_url` bisa diakses publik.

---

## 8. Akun bawaan dan data contoh

Seeder (`DatabaseSeeder` memanggil `RoleSeeder` lalu `UserSeeder`):

| Akun | Email | Password | Role |
|---|---|---|---|
| Admin | `admin@blockauth.test` | `password` | SuperAdmin |
| Demo Manager | `manager.demo@gmail.com` | `password` | Manager |
| Demo Editor | `editor.demo@gmail.com` | `password` | Editor |
| Demo Staff | `staff.demo@gmail.com` | `password` | Staff |
| Demo Viewer | `viewer.demo@gmail.com` | `password` | Viewer |
| Contoh (8 akun) | nama Indonesia acak `@gmail.com` | `password` | Staff |

---

## 9. Rute utama

| Metode | URI | Nama | Akses |
|---|---|---|---|
| GET | `/` | `home` | Publik |
| GET/POST | `/register`, `/login` | `register`, `login` | Guest |
| POST | `/logout` | `logout` | Auth |
| GET/POST | `/forgot-password` | `password.request`, `password.email` | Guest |
| GET/POST | `/reset-password` | `password.reset`, `password.update` | Guest |
| GET | `/oauth/{google,github}/redirect` | `oauth.redirect` | Guest |
| GET | `/oauth/{google,github}/callback` | `oauth.callback` | Guest |
| GET | `/dashboard` | `dashboard` | Auth + verified |
| GET | `/users` | `users.index` | SuperAdmin |
| GET/PATCH | `/profile` | `profile.edit`, `profile.update` | Auth + verified |
| POST | `/profile/avatar` | `avatar.update` | Auth + verified |
| PUT | `/password` | `password.change` | Auth + verified |

---

## 10. Skrip dan perintah berguna

```powershell
php artisan migrate:status        # cek status migrasi
php artisan db:seed --force       # tambah data contoh (buat 12 user baru tiap jalan)
php artisan tinker --execute="echo App\Models\User::count();"
npm run dev                       # vite dev server
npm run build                     # build produksi (terverifikasi sukses)
```

---

## 11. Troubleshooting

- **`Table roles doesn't exist` saat seed**: migrasi Spatie belum dipublish.
  Jalankan perintah vendor:publish di bagian instalasi, lalu `php artisan migrate`.
- **Avatar 404**: belum ada symlink storage. Jalankan `php artisan storage:link`.
- **OAuth error**: cek kredensial dan pastikan redirect URI di provider sama
  persis dengan nilai `*_REDIRECT_URI` di `.env`.
- **Email reset tidak terkirim di lokal**: normal jika `MAIL_MAILER=log`.
  Salin link reset dari log.

---

## Lisensi

MIT. Lihat `LICENSE.md`.
