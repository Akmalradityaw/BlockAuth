import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { initials } from '@/lib/ui';

function pageTitle(url) {
    if (url === '/dashboard') return 'Dashboard';
    if (url.startsWith('/users')) return 'Pengguna';
    if (url.startsWith('/roles')) return 'Matriks Akses';
    if (url.startsWith('/settings')) return 'Pengaturan';
    if (url.startsWith('/profile')) return 'Profil';
    if (url.startsWith('/audit-logs')) return 'Log Aktivitas';
    return 'BlockAuth';
}

export default function Topbar({ onOpenMobile }) {
    const { auth, announcements = [], unread_announcements_count = 0 } = usePage().props;
    const user = auth?.user;
    const roles = auth?.roles || [];
    const current = usePage().url;

    const [open, setOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const menuRef = useRef(null);
    const notifRef = useRef(null);

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Tutup dropdown saat ESC
    useEffect(() => {
        function handleKey(e) {
            if (e.key === 'Escape') {
                setOpen(false);
                setNotifOpen(false);
            }
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'blockauth-dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'blockauth');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch {
            // abaikan
        }
    }, [theme]);

    function toggleTheme() {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }

    function handleMarkRead(id) {
        router.post(`/announcements/${id}/read`, {}, { preserveScroll: true });
    }

    function handleMarkAllRead() {
        router.post('/announcements/read-all', {}, { preserveScroll: true });
    }

    return (
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 backdrop-blur lg:px-6 transition-colors">
            {/* Tombol menu (mobile) */}
            <button
                type="button"
                onClick={onOpenMobile}
                className="btn btn-sm btn-square border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 lg:hidden"
                aria-label="Buka menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Judul halaman */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1E1B4B] dark:text-slate-100">
                    {pageTitle(current)}
                </p>
            </div>

            {/* Theme Switcher */}
            <button
                type="button"
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition"
                aria-label="Ganti Tema Tampilan"
                title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
                {theme === 'dark' ? (
                    <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
                <button
                    type="button"
                    onClick={() => {
                        setNotifOpen((v) => !v);
                        setOpen(false);
                    }}
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition"
                    aria-label="Notifikasi"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unread_announcements_count > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm">
                            {unread_announcements_count > 9 ? '9+' : unread_announcements_count}
                        </span>
                    )}
                </button>

                {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-800/60">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifikasi & Pengumuman</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {unread_announcements_count > 0
                                        ? `${unread_announcements_count} belum dibaca`
                                        : 'Semua notifikasi telah dibaca'}
                                </p>
                            </div>
                            {unread_announcements_count > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllRead}
                                    className="text-xs font-semibold text-[#6D28D9] dark:text-violet-400 hover:underline"
                                >
                                    Tandai semua dibaca
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                            {announcements.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                                    Belum ada pengumuman sistem saat ini.
                                </div>
                            ) : (
                                announcements.map((a) => (
                                    <div
                                        key={a.id}
                                        className={`p-3.5 transition ${
                                            a.is_read
                                                ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/70'
                                                : 'bg-violet-50/40 dark:bg-violet-950/30 hover:bg-violet-50/70 dark:hover:bg-violet-950/50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                        a.type === 'danger'
                                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                                            : a.type === 'warning'
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                            : a.type === 'success'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                                    }`}
                                                >
                                                    {a.type}
                                                </span>
                                                {a.pinned && (
                                                    <span className="rounded bg-slate-200 dark:bg-slate-800 px-1 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                                                        Disematkan
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-400 shrink-0">{a.created_at}</span>
                                        </div>
                                        <p className="mt-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100">{a.title}</p>
                                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">{a.content}</p>

                                        {!a.is_read && (
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkRead(a.id)}
                                                    className="text-[11px] font-semibold text-[#6D28D9] dark:text-violet-400 hover:underline"
                                                >
                                                    Tandai dibaca
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Dropdown user */}
            {user && (
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        aria-haspopup="menu"
                        aria-expanded={open}
                    >
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-md object-cover" />
                        ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F59E0B] text-sm font-bold text-[#1E1B4B]">
                                {initials(user.name)}
                            </span>
                        )}
                        <span className="hidden text-left leading-tight sm:block">
                            <span className="block text-sm font-semibold text-[#1E1B4B] dark:text-slate-100">{user.name}</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">{roles[0] || 'User'}</span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {open && (
                        <div
                            role="menu"
                            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-50"
                        >
                            <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                                <p className="truncate text-sm font-semibold text-[#1E1B4B] dark:text-slate-100">{user.name}</p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                            </div>

                            <div className="p-1">
                                <Link
                                    href="/"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                    role="menuitem"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#6D28D9] dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Halaman Beranda
                                </Link>

                                <Link
                                    href="/profile"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                    role="menuitem"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profil Saya
                                </Link>

                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                    role="menuitem"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Keluar
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
