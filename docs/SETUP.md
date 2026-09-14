# SETUP - Instalasi Lokal BlockAuth

## 1. Syarat

PHP ^8.2 + ekstensi Laravel, Composer 2, Node 20+, MySQL (atau SQLite),
kredensial Google/GitHub jika ingin uji OAuth.

## 2. Instalasi dari nol

```powershell
composer install
npm install
Copy-Item .env.example .env
php artisan key:generate
php artisan vendor:publish --provider='Spatie\Permission\PermissionServiceProvider'
php artisan migrate --seed
php artisan storage:link
composer dev:lite
```

`composer dev` menjalankan serve + queue + log + vite; `composer dev:lite`
hanya serve + vite; `php artisan app:dev` versi Artisan native (tanpa
concurrently). Build produksi: `npm run build`.

## 3. `.env` penting

`APP_NAME=BlockAuth`, `APP_URL=http://localhost`, `DB_CONNECTION` (sqlite
contoh, mysql + nama DB untuk data nyata), `FILESYSTEM_DISK=public`,
`MAIL_MAILER=log` (dev, link reset ada di log) atau smtp (produksi),
`GOOGLE_CLIENT_ID/SECRET` + `GOOGLE_REDIRECT_URI=${APP_URL}/oauth/google/callback`
(dan pasangan `GITHUB_*`). Login demo: `admin@blockauth.test` / `password`
dan 4 akun `*.demo@gmail.com` / `password`.

## 4. Troubleshooting

- `Table roles doesn't exist` saat seed: publish Spatie dulu (langkah di
  atas), lalu `migrate`.
- Avatar 404: `php artisan storage:link` belum jalan.
- OAuth error: samakan redirect URI di provider dengan `.env`.
- Toast/spinner tidak muncul: pastikan `npm run dev` jalan (cek tidak ada
  file `public/hot` yatim tanpa dev server) atau pakai hasil `npm run build`,
  lalu hard refresh.
- Port bentrok: `php artisan app:dev --port=8001` atau serve `--port`.
