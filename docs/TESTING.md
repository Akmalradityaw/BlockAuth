# TESTING - Panduan BlockAuth

Setup nyata: PHPUnit 11.5.3 (`phpunit.xml`, bootstrap `vendor/autoload.php`),
suites `Unit` (`tests/Unit`) dan `Feature` (`tests/Feature`), coverage
`app/`. Env testing: `APP_ENV=testing`, bcrypt 4 round, cache/session array,
mail array, queue sync, telescope off. SQLite in-memory tersedia tapi
dikomentari (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`); Mockery
terinstal untuk mocking. Isi saat ini hanya `ExampleTest` bawaan di kedua
suite (+ `TestCase.php`).

## Strategi

- Unit: Action murni tanpa HTTP. Contoh `RegisterUserActionTest`:
  buat role `User` via Spatie, panggil `execute(RegisterData(...))`, assert
  user tersimpan dan `hasRole('User')`. `UploadUserAvatarActionTest`: fake
  file image, assert `avatar_path` berubah dan file 300x300 ada di
  `Storage::fake('public')`.
- Feature: alur HTTP. Contoh `test_login_berhasil`: post `/login`, assert
  redirect `dashboard` dan authenticated. `test_viewer_ditolak_hapus_user`:
  login sebagai Viewer, `delete('/users/1')`, assert 403. `test_toggle_oauth`:
  login SuperAdmin, `put('/settings', [provider, enabled])`, assert DB
  `settings` berubah.
- Mocking: Mockery untuk service eksternal (Socialite) agar test OAuth
  tidak memanggil Google/GitHub. Kebijakan: mock di batas sistem saja,
  jangan mock Eloquent untuk feature test (pakai RefreshDatabase + sqlite
  memory dengan uncomment 2 baris phpunit.xml).

## Perintah

```powershell
php artisan test
php artisan test --testsuite=Feature
php artisan test --filter=test_login_berhasil
```
