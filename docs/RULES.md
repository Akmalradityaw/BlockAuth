# RULES - Engineering Standards BlockAuth v2.1

## 1. SOLID dan Clean Code

- Single Responsibility: satu class/function satu tugas. Controller hanya
  validasi ringan, panggil Action, lalu redirect atau render.
- Logika bisnis di Action Classes (`app/Actions/Auth`, `app/Actions/Profile`).
- Validasi input selalu di Form Request (`app/Http/Requests`), tidak di controller.
- DTO (`app/DataTransferObjects`) untuk passing data kompleks antar lapisan:
  `RegisterData`, `UpdateProfileData`, `SocialiteData`.
- Service hanya untuk lintas concern (`app/Services/DevProcessRunner`).
  Config runtime di tabel `settings` via `App\Models\Setting`, bukan file config.

## 2. Batas panjang file

- Maksimal 300 baris per file (controller, action, model, komponen React).
  File Artisan dev dibatasi 100 baris per file.
- Jika mendekati batas, pecah jadi sub-komponen atau sub-service.

## 3. Naming convention

- Action: kata kerja + objek + `Action` (`RegisterUserAction`).
- Request: objek + `Request` (`AvatarUploadRequest`).
- Controller per aksi (`LoginController::create/store/destroy`).
- Permission: `resource:action` huruf kecil (`users:read`, `roles:manage`).
- Route: `users.index`, `users.destroy`, `roles.permissions`,
  `settings.index`, `password.request/email/reset/update`, `oauth.redirect/callback`.
- Komponen React: PascalCase (`AvatarUploader.jsx`); helper kecil camelCase
  (`lib/can.js` mengekspor `can()`).
- Test: `tests/Unit` untuk unit, `tests/Feature` untuk feature, class
  `{Nama}Test`, method `test_*` atau `*_berhasil`.

## 4. Otorisasi

- Spatie Permission, tanpa tabel custom. Model role kustom `App\Models\Role`
  terdaftar di `config/permission.php`.
- Daftar permission user pakai `getAllPermissions` (direct + via role).
  Dilarang `getPermissionNames` untuk keputusan akses (hanya direct).
- Guard per aksi via `Gate::authorize` di controller dan Policy
  (`UserPolicy::viewAny` delegasi ke `can('users:read')`).
- Frontend render kondisional via helper `can()` dari prop
  `auth.permissions`. Tombol Hapus dan Kelola Akses tidak render tanpa izin.
- Aksi hapus wajib ConfirmDialog, dilarang `confirm()` native.
- Toast global satu instance di AppLayout untuk flash dan error validasi.
  Halaman auth memakai Alert inline.

## 5. Git flow

- Branch: `main` (rilis, tag `v2.0.0`), `develop` (integrasi),
  `feature/*` (kerjaan, branch dari develop).
- Commit per fitur dengan pesan konvensional (`feat(auth): ...`,
  `feat(ui): ...`, `docs: ...`, `chore(project): ...`).
- Jangan commit `vendor/`, `node_modules/`, `.env`, `public/build`,
  `public/storage`, `.codegraph/`, `bootstrap/cache/`.
