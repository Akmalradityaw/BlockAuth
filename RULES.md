RULES - BlockAuth
Versi: 2.0

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
- Gunakan Spatie Permission untuk RBAC.
- Buat Policy untuk update profil.
- Gunakan middleware auth, verified, guest sesuai kebutuhan.

7. Ketentuan Lain
- Gunakan Laravel 12, PHP 8.3+.
- Gunakan Inertia.js + React.
- Gunakan Tailwind CSS v3 + daisyUI.
- Semua upload avatar disimpan di storage/app/public/avatars dan di-resize ke 300x300.
