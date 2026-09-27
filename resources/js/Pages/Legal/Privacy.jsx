import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Privacy() {
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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased transition-colors duration-200 dark:bg-[#0B0F19] dark:text-slate-100">
            <Head title="Kebijakan Privasi & GDPR - BlockAuth" />

            {/* Top Navbar */}
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-[#0B0F19]">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B] text-lg font-black text-[#1E1B4B]">
                            B
                        </span>
                        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                            BlockAuth
                        </span>
                    </Link>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Ganti tema"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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

                        {user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D28D9] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5B21B6]"
                            >
                                Kembali ke Dashboard →
                            </Link>
                        ) : (
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                ← Beranda
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Document Content */}
            <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors sm:p-10 dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-100 pb-6 dark:border-slate-800">
                        <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800 dark:bg-violet-950/60 dark:text-violet-300">
                            Kepatuhan Regulasi & Privasi
                        </span>
                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                            Kebijakan Privasi & Kepatuhan GDPR
                        </h1>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Terakhir Diperbarui: 27 September 2026 · Berlaku untuk seluruh ekosistem BlockAuth
                        </p>
                    </div>

                    <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        <section>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                1. Komitmen Privasi Data
                            </h2>
                            <p className="mt-2">
                                BlockAuth menghargai kerahasiaan dan integritas data pribadi Anda. Kebijakan ini menjelaskan bagaimana data identitas, log aktivitas autentikasi, serta kredensial keamanan dikumpulkan, diproses, dan dilindungi sesuai standar General Data Protection Regulation (GDPR) dan UU Perlindungan Data Pribadi.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                2. Data yang Dikumpulkan & Diproses
                            </h2>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                <li><strong>Data Akun:</strong> Nama lengkap, alamat email, dan bio profil pengguna.</li>
                                <li><strong>Kredensial Keamanan:</strong> Hash kata sandi menggunakan algoritma Argon2id/Bcrypt, kunci publik WebAuthn Passkeys, dan secret TOTP 2FA terenkripsi AES-256.</li>
                                <li><strong>Data Forensik & Keamanan:</strong> Alamat IP, user-agent peramban, fingerprint perangkat, dan log riwayat login untuk pendeteksian anomali atau serangan brute force.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                3. Hak Pengguna Berdasarkan Regulasi GDPR
                            </h2>
                            <p className="mt-2">
                                Setiap pemilik akun di BlockAuth memiliki hak penuh atas datanya, meliputi:
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                <li><strong>Hak Portabilitas Data (Export):</strong> Mengunduh seluruh data akun dan arsip aktivitas dalam format JSON terstruktur via menu Profil.</li>
                                <li><strong>Hak Penghapusan Akun (Right to be Forgotten):</strong> Menghapus akun secara permanen beserta seluruh sesi aktif dan token API.</li>
                                <li><strong>Hak Koreksi:</strong> Memperbarui informasi profil, merotasi kata sandi, dan mencabut sesi aktif dari perangkat lain.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                4. Keamanan & Retensi Data
                            </h2>
                            <p className="mt-2">
                                Data disimpan menggunakan proteksi lapis ganda. Audit log disimpan untuk keperluan audit forensik dan kepatuhan hukum, dan dapat dihapus sesuai kebijakan siklus retensi institusi Anda.
                            </p>
                        </section>
                    </div>

                    <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
                        <Link
                            href="/"
                            className="text-xs font-semibold text-[#6D28D9] dark:text-violet-400 hover:underline"
                        >
                            ← Kembali ke Halaman Utama
                        </Link>
                        <Link
                            href="/terms"
                            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline"
                        >
                            Ketentuan Layanan →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
