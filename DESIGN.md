DESIGN SYSTEM - BlockAuth
Versi: 2.1

1. Warna Solid Baru (v2, tanpa gradien)
- Indigo Ink (#1E1B4B) : Navbar, footer, panel brand, teks judul.
- Violet Punch (#6D28D9) : Tombol utama, link aktif, fokus input. Hover #5B21B6.
- Amber Pop (#F59E0B) : Aksen sekunder, badge SuperAdmin, CTA alternatif. Teks di atasnya Ink.
- Slate Line (#334155) : Teks sekunder, border tabel, divider.
- Paper (#F8FAFC) : Background halaman. Mist (#EEF2FF) : Panel lembut.
- Putih (#FFFFFF) : Background kartu dan teks di atas warna gelap.

2. Tipografi Responsif
- Font: Inter, Instrument Sans, system sans.
- Display: clamp 28px ke 40px, weight 800, tracking -0.02em. Hero dan panel brand.
- H1: clamp 22px ke 28px, weight 700. Judul halaman di AppLayout.
- H2: 20px, weight 600. Judul kartu dan seksi.
- Body: 16px, line height 1.6. Small: 14px. Caption: 12px uppercase tracking 0.08em.
- Aturan: satu H1 per halaman, eyebrow caption di atas judul, desc singkat di bawahnya.

3. Komponen
- Tombol: primary violet teks putih, amber teks ink, ghost putih outline. Rounded 0.65rem.
- Kartu: putih, border slate 200, radius 1rem, padding 16px HP dan 24px desktop.
- Input: bordered putih, fokus outline violet.
- Badge role: SuperAdmin amber solid, role lain mist dengan teks violet. Role sistem dapat badge Sistem.
- Tabel: bungkus overflow-x-auto di desktop, jadi kartu vertikal di HP (breakpoint md).
- Toast: kartu tengah layar, sukses indigo dan error merah, auto-hilang 4 detik, tombol tutup. Satu instance global di AppLayout.
- ConfirmDialog: modal tengah untuk aksi hapus, varian danger dan primary, tutup via ESC atau backdrop, kunci scroll.
- Alert: pesan inline info/sukses/warning/error untuk halaman auth.
- LoadingOverlay: fullscreen blur dengan spinner untuk operasi lambat saja.
- Chart: batang violet solid, tanpa legend, tinggi 256px, sumbu Y bilangan bulat.

4. Layout Responsif
- Auth: split 2 kolom di lg (panel brand indigo kiri, form kanan). Satu kolom tengah di HP.
- App: sidebar fixed kiri (w-20 ciut, w-72 lebar), konten offset padding kiri menyesuaikan. Sidebar diam, hanya nav yang scroll, quick-card terkunci di bawah. Drawer overlay di HP. Konten max 80rem, padding 24px HP dan 40px desktop.
- Dashboard: stats 1 kolom HP, 2 kolom sm, 3 kolom lg. Daftar terbaru dengan avatar dan role.
- Users: kartu di HP, tabel di md ke atas, paginasi join yang wrap di HP.
- Profile: 1 kolom HP, grid 12 kolom di lg (form 8, avatar sticky 4).

5. Ikon
- Gunakan huruf inisial di avatar bulat sebagai pengganti ikon. Warna indigo atau violet solid.

6. Larangan
- Tidak ada gradient warna.
- Tidak ada em-dash/en-dash dalam teks.
