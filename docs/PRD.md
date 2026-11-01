# PRD - BlockAuth v2.0

Tanggal: 2026-09-13. Dokumen induk di root (`README.md`, `CHANGELOG.md`).

## 1. Latar belakang

Aplikasi internal butuh modul autentikasi dan profil yang bisa dipakai ulang:
registrasi, login, reset password, login sosial, edit profil dan avatar,
plus kontrol akses bertingkat. BlockAuth dibangun sebagai slice vertikal
monolit Laravel + Inertia React, bukan SPA terpisah dan bukan API publik.

## 2. Problem statement

- Auth bawaan Laravel (Breeze/Jetstream) membawa UI dan opini yang tidak
  sesuai design system proyek.
- Hak akses berbasis role tunggal tidak cukup; butuh izin granular per aksi
  (baca vs hapus) yang bisa diubah admin tanpa deploy ulang.
- Toggle provider OAuth dan konfigurasi runtime tidak boleh tertanam di file
  config yang butuh deploy untuk berubah.

## 3. Target user

| Role | Kebutuhan |
|---|---|
| SuperAdmin | Akses penuh, kelola matriks permission, toggle OAuth |
| Manager | CRUD data user, tanpa konfigurasi sistem |
| Editor | Create, read, update data, tanpa delete |
| Staff | Read dan create input harian |
| Viewer | Read-only dan audit |

Akun demo (password semua `password`): `admin@blockauth.test`,
`manager.demo@gmail.com`, `editor.demo@gmail.com`, `staff.demo@gmail.com`,
`viewer.demo@gmail.com`, plus 8 akun Staff acak dari factory.

## 4. Fitur aktual (terdeteksi dari kode)

- Auth session: registrasi (auto role Staff), login + remember, logout,
  lupa dan reset password via email (`routes/auth.php`, 37 baris).
- OAuth Google dan GitHub via Socialite, masing-masing bisa ON/OFF dari
  halaman Pengaturan. Provider mati hilang dari UI dan 404 di backend
  (`SocialiteController::ensureProviderAllowed`).
- Profil: nama, email, bio maks 500 (email berubah men-null-kan verifikasi),
  avatar JPG/PNG/WEBP maks 2MB di-resize cover 300x300 JPEG-85 ke disk
  `public/avatars`, password dengan cek current_password.
- RBAC: 5 role, permission `users:create/read/update/delete`,
  `roles:manage`, `settings:read/manage`. Matriks editable di
  `/roles/permissions` (SuperAdmin). Role punya label, deskripsi, flag
  `is_system`; checkbox `roles:manage` dikunci untuk role sistem.
- Direktori `/users` (paginasi 10, kartu di HP dan tabel di desktop, hapus
  user kecuali diri sendiri), dashboard (statistik + chart batang pendaftar
  14 hari + 5 user terbaru), settings (toggle OAuth + tautan matriks).
- Feedback: toggle optimistik, spinner saat menyimpan, toast tengah sukses
  dan error auto-hilang 4 detik, ConfirmDialog untuk hapus, Alert inline di
  halaman auth, LoadingOverlay untuk operasi lambat.

## 5. Non-fungsional

Maks 300 baris per file, tanpa CSS gradient, tanpa em/en-dash di UI dan
komentar, palet solid indigo/violet/amber, responsif 1 kolom HP dan multi
kolom desktop, sidebar fixed dan drawer di HP.
