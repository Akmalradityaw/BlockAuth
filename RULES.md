RULES - BlockAuth
Versi: 2.1

1. SOLID & Clean Code
- Single Responsibility: Setiap class/function hanya memiliki satu tugas.
- Gunakan Action Classes untuk logika bisnis.
- Gunakan Form Request untuk validasi input.
- Gunakan DTO jika data kompleks perlu dipindahkan antar lapisan.

2. Batasan Panjang File
- Maksimal 300 baris per file.
- Jika melebihi, pecah menjadi sub-komponen atau sub-service.

3. Design System Solid Color (v2)
- Warna yang diizinkan:
  - Indigo Ink (#1E1B4B)  : Navbar, footer, panel brand, teks judul
  - Violet Punch (#6D28D9): Tombol utama, link aktif, fokus input (hover #5B21B6)
  - Amber Pop (#F59E0B)   : Aksen sekunder, badge SuperAdmin, CTA alternatif
  - Slate Line (#334155)  : Teks sekunder, border, divider
  - Paper (#F8FAFC)       : Background halaman, Mist (#EEF2FF) panel lembut
  - Putih (#FFFFFF)       : Background kartu dan teks di atas warna gelap
- Tidak diperbolehkan menggunakan gradient (bg-gradient-*).
- Tipografi: Inter untuk body, Plus Jakarta Sans untuk display dan H1.
- Layout wajib responsif: 1 kolom di HP, multi kolom di sm dan lg.

4. Larangan Teks
- Dilarang menggunakan em-dash (—) atau en-dash (–) pada UI text atau komentar kode.
- Gunakan tanda hubung biasa (-) atau koma.

5. Struktur Direktori
- Controller: app/Http/Controllers
- Actions: app/Actions/{Auth,Profile}
- Requests: app/Http/Requests
- Models: app/Models
- Policies: app/Policies
- React Pages: resources/js/Pages
- React Components: resources/js/Components
- Layouts: resources/js/Layouts

6. Otorisasi
- Gunakan Spatie Permission untuk RBAC, tanpa tabel custom. Permission bernama resource:action (contoh users:read, roles:manage).
- Model role kustom: App\Models\Role (label, description, is_system). Daftarkan di config/permission.php.
- Untuk daftar permission user, pakai getAllPermissions (direct + via role). Jangan pakai getPermissionNames karena hanya direct.
- Guard per aksi via Gate::authorize di controller, bukan sekadar blokir halaman.
- Buat Policy untuk update profil dan direktori user.
- Gunakan middleware auth, verified, guest sesuai kebutuhan.
- Matriks permission hanya untuk SuperAdmin (roles:manage). Kunci roles:manage pada role sistem di UI.

7. Settings dan Feedback UI
- Konfigurasi runtime (toggle OAuth) disimpan di tabel settings via model Setting, bukan config file. Default ON jika baris belum ada.
- Toggle bersifat optimistik: flip langsung di layar, revert otomatis jika request gagal.
- Toast global terpusat di AppLayout untuk flash sukses dan error validasi. Jangan render Toast per halaman.
- Pertanyaan blocking (hapus, konfirmasi) pakai `fire()` dari Components/Swal (Promise isConfirmed). Dilarang `confirm()` native.
- Halaman auth (di luar AppLayout) memakai Alert inline untuk pesan status.
- LoadingOverlay hanya untuk operasi lambat (upload avatar), bukan navigasi biasa.

8. Ketentuan Lain
- Gunakan Laravel 12, PHP ^8.2.
- Gunakan Inertia.js + React.
- Gunakan Tailwind CSS v3 + daisyUI.
- Semua upload avatar disimpan di storage/app/public/avatars dan di-resize ke 300x300.
- Chart memakai Chart.js + react-chartjs-2, warna solid sesuai palet, tanpa legend berlebih.
