PRD - BlockAuth
Tanggal: 2026-09-13
Versi: 2.0

1. Ringkasan Produk
BlockAuth adalah modul autentikasi dan manajemen profil user yang dibangun dengan Laravel 12, Inertia.js + React, Tailwind CSS + daisyUI. Sistem menyediakan autentikasi lengkap (registrasi, login, logout, lupa password, OAuth Socialite yang bisa di-toggle), RBAC granular 5 role berbasis aksi CRUD, manajemen profil (data diri, avatar, password), direktori pengguna, matriks permission yang bisa diubah admin, dan halaman pengaturan sistem. Arsitektur modular dan clean code.

2. Tujuan
- Menyediakan sistem autentikasi yang aman dan mudah dikelola.
- Memisahkan logika bisnis ke dalam Action Classes agar controller tetap ramping.
- Menerapkan standar SOLID dan batasan 300 baris per file.
- Menggunakan design system solid color tanpa gradien untuk tampilan profesional.
- Hak akses granular per aksi (resource:action) yang bisa diubah tanpa ubah kode.

3. Fitur Utama
3.1 Autentikasi User
- Registrasi akun dengan validasi, auto-assign role "Staff".
- Login dengan session, logout, opsi ingat saya.
- Lupa password: kirim email reset link, form reset password.
- Social login: Google dan GitHub via Laravel Socialite, masing-masing bisa di ON/OFF dari halaman Pengaturan. Provider yang mati disembunyikan dari UI dan ditolak backend (404).

3.2 Manajemen Profil
- Update nama, email, bio (maks 500 karakter, email berubah men-null-kan verifikasi).
- Upload avatar dengan resize dan crop 300x300 via Intervention Image, maks 2MB.
- Update password dengan verifikasi password saat ini.

3.3 Otorisasi (RBAC)
- Roles: SuperAdmin, Manager, Editor, Staff, Viewer (via Spatie, tabel bawaan).
- Permission berbasis aksi: users:create/read/update/delete, roles:manage, settings:read/manage.
- Role punya label, deskripsi, dan flag is_system (model App\Models\Role).
- Matriks permission bisa diubah SuperAdmin dari UI (/roles/permissions), role sistem terkunci dari pencabutan roles:manage.
- Policy untuk update profil (pemilik akun atau SuperAdmin) dan direktori user (users:read).
- Middleware: auth, verified, guest. Guard per aksi via Gate, bukan sekadar blokir halaman.

3.4 Direktori, Dashboard, dan Pengaturan
- Dashboard: statistik, chart batang pendaftar 14 hari, 5 pengguna terbaru.
- Direktori pengguna (/users): kartu di HP, tabel di desktop, paginasi 10, hapus user (users:delete, tidak bisa hapus diri sendiri).
- Pengaturan (/settings, SuperAdmin): toggle OAuth Google/GitHub tersimpan ke tabel settings, toast sukses/error di tengah layar.

4. Kebutuhan Non-Fungsional
- Kode bersih, modular, dan terstruktur.
- File tidak melebihi 300 baris.
- Tidak menggunakan CSS gradient.
- Tidak menggunakan em-dash atau en-dash pada teks UI/komentar.
- Menggunakan warna solid v2: Indigo Ink (#1E1B4B), Violet Punch (#6D28D9), Amber Pop (#F59E0B), Slate (#334155), Paper (#F8FAFC), Putih (#FFFFFF).
- Layout responsif: sidebar fixed di desktop dan drawer di HP, 1 kolom di HP dan multi kolom di sm/lg.
- Feedback renovasi: toggle optimistik, spinner saat menyimpan, toast tengah auto-hilang 4 detik, dialog konfirmasi untuk aksi hapus.

5. User Stories
- Sebagai pengguna, saya ingin mendaftar dan masuk ke akun saya.
- Sebagai pengguna, saya ingin mereset password jika lupa.
- Sebagai pengguna, saya ingin mengubah data profil dan foto avatar.
- Sebagai Manager, saya ingin mengelola data user (CRUD) tanpa akses konfigurasi sistem.
- Sebagai Editor, saya ingin input dan ubah data tanpa bisa menghapus.
- Sebagai Staff, saya ingin input data harian tanpa bisa mengubah yang sudah submit.
- Sebagai Viewer, saya ingin melihat data dan laporan saja.
- Sebagai SuperAdmin, saya ingin mengubah matriks permission dan toggle OAuth tanpa ubah kode.

6. Kriteria Penerimaan
- Semua fitur berjalan sesuai spesifikasi.
- Tidak ada gradient pada UI.
- Tidak ada file >300 baris.
- Validasi input berjalan baik dan error tampil sebagai toast.
- OAuth yang dimatikan hilang dari UI dan 404 di backend.
- Matriks permission tersimpan dan langsung berlaku tanpa deploy ulang.
