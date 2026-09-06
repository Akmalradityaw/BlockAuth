PRD - BlockAuth
Tanggal: 2026-01-15
Versi: 1.0

1. Ringkasan Produk
BlockAuth adalah modul autentikasi dan manajemen profil user yang dibangun dengan Laravel 12, Inertia.js + React, Tailwind CSS + daisyUI. Sistem menyediakan autentikasi lengkap (registrasi, login, logout, lupa password, OAuth Socialite) dan manajemen profil (data diri, avatar, password) dengan arsitektur modular dan clean code.

2. Tujuan
- Menyediakan sistem autentikasi yang aman dan mudah dikelola.
- Memisahkan logika bisnis ke dalam Action Classes agar controller tetap ramping.
- Menerapkan standar SOLID dan batasan 300 baris per file.
- Menggunakan design system solid color tanpa gradien untuk tampilan profesional.

3. Fitur Utama
3.1 Autentikasi User
- Registrasi akun dengan validasi, auto-assign role "User".
- Login dengan session, logout.
- Lupa password: kirim email reset link, form reset password.
- Social login: Google & GitHub via Laravel Socialite.

3.2 Manajemen Profil
- Update nama, email, bio.
- Upload avatar dengan resize 300x300 via Intervention Image.
- Update password.

3.3 Otorisasi
- Roles: SuperAdmin, User (via Spatie).
- Policy untuk update profil (hanya pemilik akun atau SuperAdmin).
- Middleware: auth, verified, guest.

4. Kebutuhan Non-Fungsional
- Kode bersih, modular, dan terstruktur.
- File tidak melebihi 300 baris.
- Tidak menggunakan CSS gradient.
- Tidak menggunakan em-dash atau en-dash pada teks UI/komentar.
- Menggunakan warna solid: Teal (#006064), Biru Kobalt (#003366), Abu Charcoal (#2F4F4F), Putih (#FFFFFF).

5. User Stories
- Sebagai pengguna, saya ingin mendaftar dan masuk ke akun saya.
- Sebagai pengguna, saya ingin mereset password jika lupa.
- Sebagai pengguna, saya ingin mengubah data profil dan foto avatar.
- Sebagai admin, saya dapat mengelola semua user.

6. Kriteria Penerimaan
- Semua fitur berjalan sesuai spesifikasi.
- Tidak ada gradient pada UI.
- Tidak ada file >300 baris.
- Validasi input berjalan baik.
- OAuth Google & GitHub berhasil login.
