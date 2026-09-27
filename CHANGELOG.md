# Changelog BlockAuth

## v2.1.3 - 2026-09-27
- **Fitur Baru**: Login bisa menggunakan `username` atau `email`.
- **Fitur Baru**: *Switch Role* instan pada halaman Data Pengguna via dropdown untuk SuperAdmin.
- **Pembaruan UI**: Diagram Dashboard dirombak ke gaya *Crypto/Trading* (Area Chart bergradasi) menggunakan ApexCharts.
- **Perbaikan**: Sidebar menu sekarang mempertahankan *scroll position* (interaktif) saat navigasi menu.
- **Perbaikan Bug**: Perbaikan `DataTable` yang sempat mengalami error saat rendering parameter.
## v2.1 - 2026-09-13
- Sidebar fixed kiri dengan offset konten, drawer overlay di HP.
- Komponen feedback: Toast global, ConfirmDialog, Alert, LoadingOverlay.
- Toggle OAuth optimistik dengan spinner dan toast tengah.
- Chart pendaftar 14 hari di dashboard (Chart.js).
- Role punya label, deskripsi, dan flag is_system.
- Data seeder nama Indonesia dengan email gmail dan akun demo per role.
- Custom command composer dev:lite (serve + vite).

## v2.0 - 2026-09-06
- Ganti palet ke indigo, violet, dan amber (tinggalkan teal dan kobalt).
- Tipografi responsif Inter + Plus Jakarta Sans.
- RBAC granular 5 role (SuperAdmin, Manager, Editor, Staff, Viewer) dengan matriks permission yang bisa diubah dari UI.
- Halaman Pengaturan (toggle OAuth) dan Data Pengguna (paginasi + hapus).
- Tabel settings untuk konfigurasi runtime.

## v1.0 - 2026-01-15
- Rilis awal: registrasi, login, logout, lupa password, OAuth Google dan GitHub.
- Manajemen profil: data diri, avatar 300x300, password.
- Role SuperAdmin dan User via Spatie.
- Palet awal: teal dalam, biru kobalt, abu charcoal.
