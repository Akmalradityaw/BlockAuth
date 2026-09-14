# API - Kontrak Route BlockAuth

Proyek ini monolit Inertia, bukan REST JSON publik. Kontrak di bawah adalah
route web aktual: request form/JSON via `router` Inertia, respons berupa
halaman Inertia atau redirect + flash. Error validasi 422 dipetakan ke prop
`errors` (pesan pertama per field); 403 untuk guard gagal; provider OAuth
mati = 404.

## Auth (`routes/auth.php`, middleware guest kecuali logout)

| Method | URI | Nama | Payload | Respons |
|---|---|---|---|---|
| GET/POST | `/register` | `register` | name, email, password, password_confirmation | login + redirect `dashboard` |
| GET/POST | `/login` | `login` | email, password, remember? | regenerate session + redirect `dashboard` |
| POST | `/logout` | `logout` (auth) | - | invalidate session + redirect `login` |
| GET/POST | `/forgot-password` | `password.request/email` | email | `back()` + status atau error email |
| GET/POST | `/reset-password[/{token}]` | `password.reset/update` | token, email, password + konfirmasi | reset + event PasswordReset, redirect `login` |
| GET | `/oauth/{google,github}/redirect` | `oauth.redirect` | - | redirect provider (404 jika provider mati) |
| GET | `/oauth/{google,github}/callback` | `oauth.callback` | - | find-or-create + login remember + redirect `dashboard` |

## App (`routes/web.php`, middleware auth + verified)

| Method | URI | Nama | Guard | Payload | Respons |
|---|---|---|---|---|---|
| GET | `/` | `home` | publik | - | halaman Welcome |
| GET | `/dashboard` | `dashboard` | auth | - | user, stats, recentUsers[5], isSuperAdmin, chart{labels[14], data[14]} |
| GET | `/users` | `users.index` | `users:read` | - | users paginasi 10 (id, name, email, bio, avatar_url, roles, verified, joined) + stats |
| DELETE | `/users/{user}` | `users.destroy` | `users:delete` | - | 403 jika hapus diri sendiri, lalu `back()` + status |
| GET/PUT | `/roles/permissions` | `roles.permissions[.update]` | `roles:manage` | matrix{roleId: [perm]} (PUT, whitelist permission) | halaman matriks / `back()` + status |
| GET/PUT | `/settings` | `settings.index/update` | `settings:read/manage` | provider[google,github], enabled bool (PUT) | toggles / `back()` + status |
| GET/PATCH | `/profile` | `profile.edit/update` | pemilik/SuperAdmin | name, email unique-ignore-self, bio? | `back()` + status |
| POST | `/profile/avatar` | `avatar.update` | pemilik/SuperAdmin | avatar image jpg/png/webp maks 2MB | resize 300x300 + `back()` + status |
| PUT | `/password` | `password.change` | auth | current_password, password + konfirmasi | `back()` + status |

## DTO

`RegisterData(name, email, password)`, `UpdateProfileData(name, email, bio?)`,
`SocialiteData(provider, providerId, name, email, token?, avatar?)`.
