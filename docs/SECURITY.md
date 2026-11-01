# SECURITY - BlockAuth

## 1. Autentikasi

- Session driver `database`, lifetime 120 menit, regenerasi tiap login.
  Password di-hash (cast `hashed`), `remember_token` standar.
- Rate limiting login mengandalkan throttle bawaan Laravel pada rute auth.
- Reset password via token `password_reset_tokens` + event `PasswordReset`.
- OAuth: stateful Socialite, email wajib dari provider; akun lama dengan
  email sama di-link otomatis (tanpa duplikat). Provider yang dimatikan
  mengembalikan 404 di redirect dan callback.
- Akun OAuth dibuat dengan password acak 32 char dan email terverifikasi
  langsung (implisit dari provider).

## 2. Otorisasi (RBAC)

- Spatie Permission: 5 role, 7 permission (`users:*`, `roles:manage`,
  `settings:*`). Guard per aksi di controller via `Gate::authorize`;
  `UserPolicy` untuk profil dan direktori. Frontend hanya cermin (helper
  `can()`); keputusan akhir selalu backend.
- `/roles/permissions` dan `/settings` khusus SuperAdmin. Checkbox
  `roles:manage` dikunci untuk role sistem agar tidak lockout via UI.
- Hapus user menolak hapus diri sendiri (403).
- ponytail: tanpa guard last-SuperAdmin (satu admin terakhir bisa terhapus
  atau kehilangan manage; tambah cek count jika tim membesar).

## 3. Data dan upload

- Validasi di Form Request: email unik (ignore-self saat update), bio maks
  500, avatar image jpg/png/webp maks 2MB, password min 8 + konfirmasi +
  current_password untuk ganti password.
- Avatar di-resize server-side (cover 300x300 JPEG-85) sebelum simpan;
  file lama dihapus. Path disimpan relatif, URL via `asset('storage/')`.
- Kolom sensitif hidden saat serialisasi: `password`, `remember_token`,
  `provider_token`. Prop Inertia hanya kirim field yang dibutuhkan
  (`only([...])`), tidak pernah model utuh.
- Error validasi hanya kirim pesan pertama per field; stack trace tidak
  bocor ke client (exception handler default + `.env` produksi
  `APP_DEBUG=false`).
