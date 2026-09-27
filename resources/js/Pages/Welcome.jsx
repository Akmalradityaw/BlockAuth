import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'blockauth-dark');
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'blockauth');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch { }
    }, [theme]);

    const toggleTheme = () => setTheme((p) => (p === 'dark' ? 'light' : 'dark'));

    const featurePillars = [
        {
            category: 'Autentikasi & Identitas Modern',
            tag: 'Identity & Auth',
            tagColor: 'text-violet-700 bg-violet-100 dark:bg-violet-950/60 dark:text-violet-300',
            accent: 'bg-violet-600',
            borderColor: 'border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-600',
            icon: (
                <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            items: [
                { title: 'Autentikasi Dua Faktor (2FA)', desc: 'Dukungan TOTP (Google Authenticator, Authy) dengan QR Code instan dan recovery codes terenkripsi.' },
                { title: 'Passkeys Biometrik (WebAuthn)', desc: 'Masuk tanpa kata sandi dengan sidik jari, Face ID, atau kunci hardware standar FIDO2.' },
                { title: 'Login Sosial OAuth 2.0', desc: 'Masuk instan dengan Google dan GitHub dengan penyatuan akun otomatis.' },
                { title: 'Personal Access Tokens', desc: 'Manajemen API token berbasis Laravel Sanctum dengan izin granular.' },
            ],
        },
        {
            category: 'Keamanan Jaringan & Audit Forensik',
            tag: 'Network & Security',
            tagColor: 'text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300',
            accent: 'bg-amber-500',
            borderColor: 'border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600',
            icon: (
                <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            items: [
                { title: 'Firewall IP Blacklist & Whitelist', desc: 'Blokir IP berbahaya atau izinkan IP terpercaya dengan deteksi otomatis klien.' },
                { title: 'Deteksi Perangkat Baru', desc: 'Pemantauan fingerprint login baru dengan alert keamanan otomatis.' },
                { title: 'Proteksi Brute Force', desc: 'Penguncian akun otomatis setelah kegagalan berulang dengan durasi decay.' },
                { title: 'Audit Log Forensik', desc: 'Pencatatan event sistem: login, logout, perubahan konfigurasi, rotasi peran.' },
            ],
        },
        {
            category: 'Otorisasi Granular & Tata Kelola',
            tag: 'Governance & RBAC',
            tagColor: 'text-indigo-700 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300',
            accent: 'bg-indigo-600',
            borderColor: 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600',
            icon: (
                <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            items: [
                { title: 'Matriks Hak Akses Granular (RBAC)', desc: 'Peran multi-tingkat (SuperAdmin, Manager, Editor, Staff, Viewer).' },
                { title: 'Impersonasi Akun Pengguna', desc: 'Administrator dapat masuk sementara sebagai user lain untuk audit dan verifikasi.' },
                { title: 'Manajemen Pengguna Interaktif', desc: 'DataTable dengan pencarian, filter peran/status, ekspor CSV terstruktur.' },
                { title: 'Kebijakan Kompleksitas Password', desc: 'Validasi panjang minimum, kombinasi huruf besar, angka, dan simbol khusus.' },
            ],
        },
        {
            category: 'Pemantauan Sesi & Integrasi Sistem',
            tag: 'Real-time Operations',
            tagColor: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300',
            accent: 'bg-emerald-600',
            borderColor: 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600',
            icon: (
                <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            items: [
                { title: 'Pemantauan Sesi Global', desc: 'Inspeksi sesi aktif seluruh pengguna, analisis platform/browser, force logout.' },
                { title: 'Webhook Event Dispatcher', desc: 'HTTP POST bertanda tangan HMAC-SHA256 untuk event registrasi, login, lockout.' },
                { title: 'Pusat Siaran & Pengumuman', desc: 'Notifikasi multi-kategori (info, warning, danger, success) dengan mode pinned.' },
                { title: 'Mode Pemeliharaan Sistem', desc: 'Kunci operasional aplikasi saat update database dengan akses SuperAdmin.' },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased transition-colors duration-200 dark:bg-[#0B0F19] dark:text-slate-100">
            <Head title="BlockAuth - Infrastruktur Autentikasi & Keamanan Enterprise" />

            {/* ============ DEDICATED CLEAN NAVBAR ============ */}
            <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-[#0B0F19]">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B] text-lg font-black text-[#1E1B4B]">
                            B
                        </span>
                        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                            BlockAuth
                        </span>
                    </Link>

                    {/* Actions: Only Dashboard Return Button (for logged-in) & Dark Mode Toggle */}
                    <div className="flex items-center gap-3">
                        {/* Dark Mode Switcher */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Ganti tema gelap atau terang"
                            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                            {theme === 'dark' ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Auth-state actions */}
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5B21B6] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                            >
                                <span>Kembali ke Dashboard</span>
                                <span aria-hidden>→</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center rounded-xl bg-[#6D28D9] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5B21B6]"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* ============ HERO SECTION ============ */}
            <header className="relative border-b border-slate-200 bg-white pt-12 pb-16 transition-colors sm:pt-16 sm:pb-24 dark:border-slate-800 dark:bg-[#0B0F19]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center">
                        {/* Eyebrow Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
                            </span>
                            Infrastruktur Autentikasi, RBAC & Firewall Siap Produksi
                        </div>

                        {/* Judul Utama (Solid Color, No Gradients) */}
                        <h1 className="mt-6 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                            Fondasi Keamanan Akun{' '}
                            <span className="block text-[#6D28D9] dark:text-violet-400">
                                Berstandar Enterprise Modern
                            </span>
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                            BlockAuth menyediakan sistem otentikasi komprehensif dengan dukungan Passkey WebAuthn, 2FA TOTP, otorisasi RBAC granular, firewall IP cerdas, webhook engine, serta pemantauan sesi global secara real-time.
                        </p>

                        {/* Tombol Aksi: Khusus user login hanya tombol Kembali ke Dashboard */}
                        <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-3 sm:w-auto">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B21B6] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F19] sm:w-auto"
                                >
                                    <span>Kembali ke Dashboard</span>
                                    <span aria-hidden>→</span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B21B6] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F19] sm:w-auto"
                                    >
                                        <span>Masuk ke Akun</span>
                                        <span aria-hidden>→</span>
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:w-auto"
                                    >
                                        Daftar Akun Baru
                                    </Link>
                                    <a
                                        href="#fitur-utama"
                                        className="inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
                                    >
                                        Jelajahi Fitur ↓
                                    </a>
                                </>
                            )}
                        </div>

                        {/* Metrik Solid */}
                        <div className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                            {[
                                { value: 'TOTP & FIDO2', label: '2FA & Passkey Biometrik', color: 'text-violet-600 dark:text-violet-400' },
                                { value: '5 Peran', label: 'RBAC Granular Matrix', color: 'text-amber-600 dark:text-amber-400' },
                                { value: 'HMAC-SHA256', label: 'Webhook Event Dispatcher', color: 'text-emerald-600 dark:text-emerald-400' },
                                { value: 'Firewall IP', label: 'Blacklist & Known Device', color: 'text-indigo-600 dark:text-indigo-400' },
                            ].map((m) => (
                                <div
                                    key={m.label}
                                    className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <p className={`text-lg font-extrabold sm:text-xl ${m.color}`}>{m.value}</p>
                                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{m.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* ============ FITUR UTAMA ============ */}
            <main id="fitur-utama" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#6D28D9] dark:text-violet-400">
                        Kemampuan Sistem
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Arsitektur Keamanan Berlapis Tanpa Kompromi
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                        Dirancang untuk menjamin keamanan dari lapis jaringan, kredensial pengguna, hingga integrasi pihak ketiga secara menyeluruh.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
                    {featurePillars.map((pillar) => (
                        <div
                            key={pillar.category}
                            className={`group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 ${pillar.borderColor}`}
                        >
                            {/* Accent line atas (solid color) */}
                            <div className={`absolute inset-x-0 top-0 h-1.5 ${pillar.accent}`} />

                            <div className="flex items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                    {pillar.icon}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100">
                                        {pillar.category}
                                    </h3>
                                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${pillar.tagColor}`}>
                                        {pillar.tag}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {pillar.items.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700"
                                    >
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                            {item.title}
                                        </h4>
                                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ============ CTA PANEL (SOLID COLOR) ============ */}
                <div className="mt-16 overflow-hidden rounded-3xl border border-slate-200 bg-[#1E1B4B] p-8 text-white shadow-md sm:p-12 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
                        <div className="max-w-xl">
                            <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300">
                                {user ? 'Sesi Terautentikasi' : 'Akses Cepat Administrator'}
                            </span>
                            <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                                {user ? `Selamat Datang Kembali, ${user.name?.split(' ')[0]}!` : 'Siap Mengelola Ekosistem Autentikasi Anda?'}
                            </h3>
                            <p className="mt-2 text-sm text-indigo-200/80 sm:text-base dark:text-slate-300">
                                {user
                                    ? 'Sesi login Anda aktif. Kembali ke dashboard untuk memantau keamanan akun, audit log, dan modul enterprise Anda.'
                                    : 'Kontrol penuh atas akses pengguna, audit aktivitas, keamanan jaringan, dan webhook dalam satu portal terpadu.'}
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center rounded-xl bg-[#F59E0B] px-6 py-3 text-sm font-bold text-[#1E1B4B] shadow-sm transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E1B4B]"
                                >
                                    <span>Kembali ke Dashboard</span>
                                    <span aria-hidden className="ml-1">→</span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center rounded-xl bg-[#F59E0B] px-6 py-3 text-sm font-bold text-[#1E1B4B] shadow-sm transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E1B4B]"
                                    >
                                        <span>Masuk Sekarang</span>
                                        <span aria-hidden className="ml-1">→</span>
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                    >
                                        Registrasi
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ============ FOOTER ============ */}
            <footer className="border-t border-slate-200 bg-white py-8 transition-colors dark:border-slate-800 dark:bg-[#0B0F19]">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F59E0B] text-base font-black text-[#1E1B4B]">
                            B
                        </span>
                        <div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">BlockAuth Platform</span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Laravel 12 · Inertia React · Tailwind CSS
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                        <Link href="/privacy" className="transition hover:text-slate-900 dark:hover:text-slate-200">
                            Privasi & GDPR
                        </Link>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <Link href="/terms" className="transition hover:text-slate-900 dark:hover:text-slate-200">
                            Ketentuan Layanan
                        </Link>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Ganti tema"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Terang
                                </>
                            ) : (
                                <>
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    Gelap
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
