# DESIGN - BlockAuth v2.1

Sumber: `tailwind.config.js`, `resources/css/app.css`, `resources/views/app.blade.php`.

## 1. Palet solid (tanpa gradien)

| Token | Hex | Pakai |
|---|---|---|
| `brand.ink` | `#1E1B4B` | Sidebar, footer, panel brand, judul |
| `brand.violet` | `#6D28D9` | Tombol utama, link aktif, fokus input, chart (hover `#5B21B6`) |
| `brand.amber` | `#F59E0B` | Aksen, badge SuperAdmin dan Sistem, CTA alternatif |
| `brand.slate` | `#334155` | Teks sekunder, border |
| `brand.paper` | `#F8FAFC` | Background halaman |
| `brand.mist` | `#EEF2FF` | Panel lembut, header tabel |
| white | `#FFFFFF` | Kartu, teks di atas gelap |

Tema daisyUI `blockauth`: primary violet, secondary ink, accent amber,
neutral slate, base paper/mist, success `#15803D`, warning `#B45309`,
error `#B91C1C`. Atribut `data-theme="blockauth"` di Blade.

## 2. Tipografi

Font `sans`: Inter lalu Plus Jakarta Sans; font `display`: sebaliknya.
Skala di config: display clamp 28-40px/800, h1 clamp 22-28px/700, h2 20px/600,
body 16px/1.6, small 14px, caption 12px uppercase. Class bantuan
`.type-display/.type-h1/.type-h2/.type-small/.type-caption` di `app.css`.

## 3. Layout

- App: sidebar `fixed` kiri (`w-20` ciut, `w-72` lebar), konten offset
  `lg:pl-20/72`. Nav scroll independen, quick-card terkunci bawah. Drawer
  overlay + backdrop di HP. Konten `max-w-7xl`, padding 24px HP dan 40px
  desktop.
- Auth: split 2 kolom di `lg` (panel brand + form `max-w-md`), 1 kolom di HP.
- Profile: grid 12 kolom di `lg` (form 8, avatar sticky 4).
- Users: kartu di HP, tabel di `md` ke atas.

## 4. Komponen

`SolidButton` (primary/amber), `FormInput` + error inline, `AvatarUploader`
(preview + info 300x300), `RoleBadge`, `StatCard`, `SectionTitle`,
`RegistrationsChart` (batang violet, tanpa legend, h-64),
`Toast` (tengah, sukses/error, auto-hilang), `ConfirmDialog` (danger/primary,
ESC/backdrop, kunci scroll), `Alert` (info/success/warning/error),
`LoadingOverlay` (global show/hide). Kelas animasi `ba-anim-in/out`,
`ba-spinner`, dan `body.ba-locked` ada di `app.css`.
