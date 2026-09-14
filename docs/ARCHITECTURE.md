# ARCHITECTURE - BlockAuth

## 1. Gaya arsitektur

Monolit modular Laravel 12 + Inertia.js 2 (adapter server) + React 18
(adapter client). Tidak ada REST API publik dan tidak ada SPA terpisah:
controller me-render halaman Inertia dengan props, React me-render UI,
mutasi lewat `router` Inertia (PUT/PATCH/DELETE dengan spoofing method).

## 2. Tech stack aktual

| Lapisan | Paket dan versi |
|---|---|
| Runtime | PHP ^8.2 (lingkungan 8.2.12), Laravel 12.69.1 |
| Frontend | `@inertiajs/react` ^2.0.0, `react` ^18.3.1, Vite 6.4.3, `@vitejs/plugin-react` |
| CSS | `tailwindcss` ^3.4.15, `daisyui` ^4.12.14, `autoprefixer`, `postcss`, tema `blockauth` |
| Auth sosial | `laravel/socialite` ^5.0 (Google, GitHub) |
| RBAC | `spatie/laravel-permission` ^6.0 |
| Gambar | `intervention/image-laravel` ^1.0 |
| Chart | `chart.js` + `react-chartjs-2` |
| Util | `tightenco/ziggy` ^2.0, `laravel/sanctum` ^4.0 |
| Dev | `laravel/telescope` ^5.0, `barryvdh/laravel-debugbar` ^3.14, `laravel/pail`, `concurrently` ^9.0.1 |
| Test | `phpunit/phpunit` ^11.5.3, `mockery/mockery` |

Entry frontend: `resources/js/app.jsx` via `vite.config.js` (input CSS +
`app.jsx`, alias `@` ke `resources/js`), Blade tunggal
`resources/views/app.blade.php` (`data-theme="blockauth"`, font Google
Inter + Plus Jakarta Sans). Middleware web menambahkan
`HandleInertiaRequests` yang share `auth.user`, `auth.roles`,
`auth.permissions`, `flash.status`, dan `errors` (`bootstrap/app.php`).

## 3. Tree struktur aktual

```
app/
  Actions/Auth            AuthenticateUserAction, HandleSocialiteCallbackAction, RegisterUserAction
  Actions/Profile         UpdateUserPasswordAction, UpdateUserProfileTextAction, UploadUserAvatarAction
  Console/Commands        DevCommand (php artisan app:dev)
  DataTransferObjects     RegisterData, SocialiteData, UpdateProfileData
  Http/Controllers        AvatarController, DashboardController, PasswordController,
                          ProfileController, RolePermissionController, SettingsController,
                          UserController, Auth/{Login,Register,Socialite,PasswordResetLink,NewPassword}Controller
  Http/Middleware         HandleInertiaRequests
  Http/Requests           AvatarUploadRequest, LoginRequest, RegisterRequest,
                          UpdatePasswordRequest, UpdateProfileRequest
  Models                  Role, Setting, User
  Policies                UserPolicy
  Providers               AppServiceProvider (daftarkan UserPolicy)
  Services                DevProcessRunner
resources/js/
  Components              Alert, AvatarUploader, ConfirmDialog, Footer, FormInput, Navbar,
                          RegistrationsChart, Sidebar, SolidButton, Toast, Topbar, Ui
  Layouts                 AppLayout (sidebar fixed + drawer HP), AuthLayout (split brand + form)
  Pages/Auth              ForgotPassword, Login, Register, ResetPassword
  Pages/Profile/Partials  AvatarForm, UpdatePasswordForm, UpdateProfileForm
  Pages                   Dashboard, Profile/Edit, Settings/Index, Users/Index,
                          RolePermissions/Index, Welcome
  lib/can.js              helper can(permissions, key)
routes/                   web.php (home, dashboard, users, avatar, password, roles, settings),
                          auth.php (register, login, logout, reset, oauth)
database/
  migrations              users, cache, jobs, blockauth columns, permission tables,
                          settings, roles meta
  seeders                 RoleSeeder, RbacSeeder, UserSeeder, DatabaseSeeder
  factories               UserFactory (nama id_ID, email gmail)
docs/                     9 file dokumentasi (folder ini)
```

## 4. Alur request

Browser > route web > middleware auth/guest/verified > Form Request >
Controller > Action (+ DTO) > Eloquent/Spatie/Storage > Inertia render React
atau redirect + flash. Props global selalu tersedia: user, roles,
permissions, flash, errors.
