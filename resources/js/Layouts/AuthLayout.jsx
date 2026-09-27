import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

const highlights = [
    { title: 'Autentikasi Aman & Cepat', desc: 'Dukungan Session aman, Remember Me, proteksi brute force dan audit forensik.' },
    { title: '2FA TOTP & Passkey FIDO2', desc: 'Verifikasi instan via Google Authenticator dan biometric tanpa kata sandi.' },
    { title: 'Akses RBAC Granular', desc: 'Manajemen hak akses multi-peran, firewall IP, dan webhook dispatcher.' },
];

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased transition-colors duration-200 dark:bg-[#0B0F19] dark:text-slate-100 lg:grid lg:grid-cols-2">
            {/* ============ BRAND SIDEBAR (DESKTOP) ============ */}
            <aside className="relative hidden flex-col justify-between border-r border-slate-200 bg-[#1E1B4B] p-8 text-white lg:flex xl:p-12 dark:border-slate-800 dark:bg-[#0B0F19]">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B] text-xl font-black text-[#1E1B4B] shadow-sm">
                            B
                        </span>
                        <span className="text-xl font-bold tracking-tight text-white">BlockAuth</span>
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                    >
                        <span aria-hidden>←</span>
                        Beranda
                    </Link>
                </div>

                <div className="my-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                        Infrastruktur Keamanan Enterprise
                    </div>
                    <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white xl:text-4xl">
                        Akses Sistem Terpusat, Andal, dan Terproteksi.
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-indigo-200/80 dark:text-slate-400">
                        Lindungi integritas akun Anda dengan proteksi berlapis: WebAuthn Passkeys, TOTP Authenticator, firewall IP dinamis, dan pemantauan sesi global.
                    </p>

                    <div className="mt-8 grid gap-3">
                        {highlights.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-xl border border-white/15 bg-white/5 p-4 transition dark:border-slate-800 dark:bg-slate-900/60"
                            >
                                <p className="text-sm font-bold text-white">{item.title}</p>
                                <p className="mt-1 text-xs leading-relaxed text-indigo-200/75 dark:text-slate-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-indigo-200/60 dark:text-slate-500">
                    <span>BlockAuth Platform · Keamanan Terpadu</span>
                    <span>v2.1.3</span>
                </div>
            </aside>

            {/* ============ FORM CONTENT AREA ============ */}
            <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Action Toolbar (Mobile & Desktop Top Right) */}
                <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
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

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white lg:hidden"
                    >
                        <span aria-hidden>←</span>
                        Beranda
                    </Link>
                </div>

                {/* Mobile Brand Header */}
                <div className="mb-6 flex flex-col items-center lg:hidden">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F59E0B] text-lg font-black text-[#1E1B4B]">
                            B
                        </span>
                        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">BlockAuth</span>
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-colors sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                    {eyebrow && (
                        <p className="text-xs font-bold uppercase tracking-wider text-[#6D28D9] dark:text-violet-400">
                            {eyebrow}
                        </p>
                    )}
                    {title && (
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="mt-1 mb-6 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            {subtitle}
                        </p>
                    )}
                    {children}
                </div>

                <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    <span>BlockAuth Platform · Keamanan Akun Terproteksi</span>
                </div>
            </main>
        </div>
    );
}
