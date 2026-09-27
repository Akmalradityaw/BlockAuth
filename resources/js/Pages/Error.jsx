import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

const ERROR_DETAILS = {
    403: {
        title: 'Akses Ditolak (Dilarang)',
        subtitle: 'Izin Akses Tidak Memadai',
        description:
            'Akun Anda saat ini tidak memiliki izin atau peran RBAC yang memadai untuk membuka halaman atau modul ini. Silakan hubungi Super Administrator untuk meminta penyesuaian hak akses.',
        badgeColor: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
        iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        subtitle: 'Tautan Tidak Tersedia',
        description:
            'Alamat URL yang Anda tuju tidak ditemukan pada server sistem kami. Halaman mungkin telah dihapus, dipindahkan, atau Anda salah mengetikkan alamat URL.',
        badgeColor: 'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300',
        iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    500: {
        title: 'Kesalahan Server Internal',
        subtitle: 'Gangguan Sistem Tak Terduga',
        description:
            'Terjadi kendala teknis internal pada sistem saat memproses permintaan Anda. Administrator dan tim keamanan sistem telah menerima catatan insiden ini di audit log.',
        badgeColor: 'border-red-300 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
        iconBg: 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400',
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    503: {
        title: 'Layanan Sedang Dipelihara',
        subtitle: 'Mode Pemeliharaan Aktif',
        description:
            'Sistem BlockAuth sedang dalam proses peningkatan berkala dan pemeliharaan database. Seluruh modul dikunci sementara demi integritas data.',
        badgeColor: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
        iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
    },
    419: {
        title: 'Sesi Autentikasi Kedaluwarsa',
        subtitle: 'Masa Berlaku Token Habis',
        description:
            'Sesi peramban atau token CSRF keamanan Anda telah berakhir karena tidak ada aktivitas dalam rentang waktu tertentu. Silakan muat ulang halaman atau login kembali.',
        badgeColor: 'border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300',
        iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    401: {
        title: 'Sesi Tidak Terautentikasi',
        subtitle: 'Login Diperlukan',
        description:
            'Anda harus masuk ke akun BlockAuth terlebih dahulu sebelum dapat mengakses halaman atau modul yang diminta.',
        badgeColor: 'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300',
        iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
        ),
    },
};

export default function Error({ status, message }) {
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

    const detail = ERROR_DETAILS[status] || {
        title: 'Terjadi Kesalahan',
        subtitle: `Galat Kode HTTP ${status || 'Unknown'}`,
        description:
            message ||
            'Permintaan Anda tidak dapat diselesaikan saat ini. Silakan kembali ke dashboard atau coba beberapa saat lagi.',
        badgeColor: 'border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
        iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 antialiased transition-colors duration-200 dark:bg-[#0B0F19] dark:text-slate-100">
            <Head title={`${status || 'Error'} - ${detail.title} - BlockAuth`} />

            {/* Top Navigation */}
            <header className="border-b border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-[#0B0F19]">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <span aria-hidden>←</span>
                            Beranda
                        </Link>
                    </div>
                </div>
            </header>

            {/* Error Body */}
            <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-xl text-center">
                    {/* Error Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-colors sm:p-12 dark:border-slate-800 dark:bg-slate-900">
                        {/* Status Code Pill */}
                        <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-current" />
                            <span>Galat {status || 500} · {detail.subtitle}</span>
                        </div>

                        {/* Icon */}
                        <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm sm:h-20 sm:w-20">
                            <div className={`flex h-full w-full items-center justify-center rounded-2xl ${detail.iconBg}`}>
                                {detail.icon}
                            </div>
                        </div>

                        {/* Judul & Deskripsi */}
                        <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                            {detail.title}
                        </h1>

                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                            {detail.description}
                        </p>

                        {/* Rincian Pesan Teknis Khusus (Bila Ada) */}
                        {message && message !== detail.description && (
                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left text-xs font-mono text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                                <span className="font-sans font-bold text-slate-900 dark:text-white">Detail Pesan:</span> {message}
                            </div>
                        )}

                        {/* Tombol Aksi */}
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B21B6] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:w-auto"
                                >
                                    <span>Kembali ke Dashboard</span>
                                    <span aria-hidden>→</span>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B21B6] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:w-auto"
                                >
                                    <span>Masuk ke Akun</span>
                                    <span aria-hidden>→</span>
                                </Link>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    if (typeof window !== 'undefined' && window.history.length > 1) {
                                        window.history.back();
                                    } else {
                                        window.location.href = '/';
                                    }
                                }}
                                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
                            >
                                Kembali ke Halaman Sebelumnya
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        window.location.reload();
                                    }
                                }}
                                className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 sm:w-auto"
                            >
                                Muat Ulang
                            </button>
                        </div>
                    </div>

                    <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
                        BlockAuth Platform · Infrastruktur Autentikasi & Keamanan Enterprise
                    </p>
                </div>
            </main>
        </div>
    );
}
