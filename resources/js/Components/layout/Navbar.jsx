import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { can } from '@/lib/can';
import { initials, isActive } from '@/lib/ui';

function NavBtn({ href, current, onGo, children, tone = 'ghost' }) {
    const active = isActive(current, href);
    const base = 'btn btn-sm border-0 no-animation font-semibold';
    const tones = {
        ghost: active ? 'bg-white text-[#1E1B4B] dark:bg-slate-800 dark:text-slate-100' : 'bg-white/10 text-white hover:bg-white/20',
        solid: 'bg-white text-[#1E1B4B] hover:bg-[#EEF2FF] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
        violet: active ? 'bg-[#5B21B6] text-white' : 'bg-[#6D28D9] text-white hover:bg-[#5B21B6]',
        amber: 'bg-[#F59E0B] text-[#1E1B4B] hover:bg-[#B45309] hover:text-white',
    };
    return (
        <Link href={href} onClick={onGo} className={`${base} ${tones[tone]}`}>
            {children}
        </Link>
    );
}

function UserChip({ user, role, size = 'sm' }) {
    const box = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10';
    return user?.avatar_url ? (
        <img src={user.avatar_url} alt={user.name} className={`${box} shrink-0 rounded-xl object-cover`} />
    ) : (
        <span className={`${box} flex shrink-0 items-center justify-center rounded-xl bg-[#F59E0B] font-bold text-[#1E1B4B]`}>
            {initials(user?.name)}
        </span>
    );
}

export default function Navbar() {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const roles = auth?.roles || [];
    const perms = auth?.permissions || [];
    const current = usePage().url;
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    // Tambah menu cukup satu baris di sini, tampil di desktop dan mobile.
    const links = [
        { href: '/', label: 'Beranda', tone: 'ghost', show: !!user },
        { href: '/dashboard', label: 'Dashboard', tone: 'ghost', show: !!user },
        { href: '/users', label: 'Pengguna', tone: 'ghost', show: !!user && can(perms, 'users:read') },
        { href: '/profile', label: 'Profil', tone: 'violet', show: !!user },
        { href: '/roles/permissions', label: 'Akses', tone: 'ghost', show: !!user && can(perms, 'roles:manage') },
        { href: '/login', label: 'Masuk', tone: 'solid', show: !user },
        { href: '/register', label: 'Daftar', tone: 'amber', show: !user },
    ].filter((l) => l.show);

    const logoutBtn = 'btn btn-sm border border-white/30 bg-transparent font-semibold text-white hover:bg-white/10';

    return (
        <nav className="app-navbar sticky top-0 z-40 shadow-md">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
                <Link href="/" onClick={close} className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B] text-lg font-extrabold text-[#1E1B4B]">
                        B
                    </span>
                    <span className="hidden leading-tight min-[420px]:block">
                        <span className="block text-base font-bold tracking-tight text-white">BlockAuth</span>
                        <span className="type-caption block text-white/60">Auth dan Profil</span>
                    </span>
                </Link>

                <div className="hidden items-center gap-2 md:flex">
                    {links.map((l) => (
                        <NavBtn key={l.href} href={l.href} current={current} tone={l.tone}>
                            {l.label}
                        </NavBtn>
                    ))}
                    {user && (
                        <>
                            <span className="mx-1 hidden h-6 w-px bg-white/20 lg:block" />
                            <span className="hidden max-w-40 items-center gap-2 lg:flex">
                                <UserChip user={user} />
                                <span className="min-w-0 leading-tight">
                                    <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
                                    <span className="type-caption block text-white/60">{roles[0] || 'User'}</span>
                                </span>
                            </span>
                            <Link href="/logout" method="post" as="button" className={logoutBtn}>
                                Keluar
                            </Link>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    aria-label="Menu navigasi"
                    className="btn btn-sm border border-white/30 bg-transparent text-white hover:bg-white/10 md:hidden"
                >
                    {open ? 'Tutup' : 'Menu'}
                </button>
            </div>

            {open && (
                <div className="border-t border-white/15 px-4 pb-4 pt-3 md:hidden">
                    {user && (
                        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/10 p-3">
                            <UserChip user={user} size="md" />
                            <div className="min-w-0 leading-tight">
                                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                                <p className="type-caption text-white/60">{roles[0] || 'User'}</p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {links.map((l) => (
                            <NavBtn key={l.href} href={l.href} current={current} onGo={close} tone={l.tone === 'ghost' ? 'solid' : l.tone}>
                                {l.label}
                            </NavBtn>
                        ))}
                        {user && (
                            <Link href="/logout" method="post" as="button" onClick={close} className={logoutBtn}>
                                Keluar
                            </Link>
                        )}
                    </div>
                    {flash?.status && (
                        <p className="type-small mt-3 rounded-lg bg-white/10 p-2 text-center text-white">{flash.status}</p>
                    )}
                </div>
            )}
        </nav>
    );
}
