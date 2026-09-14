import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { initials } from '@/lib/ui';

function pageTitle(url) {
    if (url === '/dashboard') return 'Dashboard';
    if (url.startsWith('/users')) return 'Pengguna';
    if (url.startsWith('/roles')) return 'Matriks Akses';
    if (url.startsWith('/settings')) return 'Pengaturan';
    if (url.startsWith('/profile')) return 'Profil';
    return 'BlockAuth';
}

export default function Topbar({ onOpenMobile }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const roles = auth?.roles || [];
    const current = usePage().url;

    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Tutup dropdown saat ESC
    useEffect(() => {
        function handleKey(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6">
            {/* Tombol menu (mobile) */}
            <button
                type="button"
                onClick={onOpenMobile}
                className="btn btn-sm btn-square border-slate-300 bg-white lg:hidden"
                aria-label="Buka menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Judul halaman */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1E1B4B]">
                    {pageTitle(current)}
                </p>
            </div>

            {/* Dropdown user */}
            {user && (
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100"
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
                            <span className="block text-sm font-semibold text-[#1E1B4B]">{user.name}</span>
                            <span className="block text-xs text-slate-500">{roles[0] || 'User'}</span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {open && (
                        <div
                            role="menu"
                            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                        >
                            <div className="border-b border-slate-100 px-4 py-3">
                                <p className="truncate text-sm font-semibold text-[#1E1B4B]">{user.name}</p>
                                <p className="truncate text-xs text-slate-500">{user.email}</p>
                            </div>

                            <div className="p-1">
                                <Link
                                    href="/profile"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                    role="menuitem"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profil
                                </Link>

                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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
