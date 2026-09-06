import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

function initials(name) {
    return (name || '?').charAt(0).toUpperCase();
}

function isActive(url, href) {
    if (href === '/') return url === '/';
    return url === href || url.startsWith(href + '/');
}

function NavBtn({ href, current, onGo, children, tone = 'ghost' }) {
    const active = isActive(current, href);
    const base = 'btn btn-sm border-0 no-animation font-semibold';
    const tones = {
        ghost: active ? 'bg-white text-[#1E1B4B]' : 'bg-white/10 text-white hover:bg-white/20',
        solid: 'bg-white text-[#1E1B4B] hover:bg-[#EEF2FF]',
        violet: active ? 'bg-[#5B21B6] text-white' : 'bg-[#6D28D9] text-white hover:bg-[#5B21B6]',
        amber: 'bg-[#F59E0B] text-[#1E1B4B] hover:bg-[#B45309] hover:text-white',
    };
    return (
        <Link href={href} onClick={onGo} className={`${base} ${tones[tone]}`}>
            {children}
        </Link>
    );
}

export default function Navbar() {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const roles = auth?.roles || [];
    const isSuperAdmin = roles.includes('SuperAdmin');
    const current = usePage().url;
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <nav className="app-navbar sticky top-0 z-40 shadow-md">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
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
                    {user ? (
                        <>
                            <NavBtn href="/dashboard" current={current} tone="ghost">Dashboard</NavBtn>
                            {isSuperAdmin && (
                                <NavBtn href="/users" current={current} tone="ghost">Pengguna</NavBtn>
                            )}
                            <NavBtn href="/profile" current={current} tone="violet">Profil</NavBtn>
                            <span className="mx-1 hidden h-6 w-px bg-white/20 lg:block" />
                            <span className="hidden max-w-40 items-center gap-2 lg:flex">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-lg object-cover" />
                                ) : (
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B] text-sm font-bold text-[#1E1B4B]">
                                        {initials(user.name)}
                                    </span>
                                )}
                                <span className="min-w-0 leading-tight">
                                    <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
                                    <span className="type-caption block text-white/60">
                                        {isSuperAdmin ? 'SuperAdmin' : 'User'}
                                    </span>
                                </span>
                            </span>
                            <Link href="/logout" method="post" as="button" className="btn btn-sm border border-white/30 bg-transparent font-semibold text-white hover:bg-white/10">
                                Keluar
                            </Link>
                        </>
                    ) : (
                        <>
                            <NavBtn href="/login" current={current} tone="solid">Masuk</NavBtn>
                            <NavBtn href="/register" current={current} tone="amber">Daftar</NavBtn>
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
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="h-10 w-10 rounded-xl object-cover" />
                            ) : (
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B] font-bold text-[#1E1B4B]">
                                    {initials(user.name)}
                                </span>
                            )}
                            <div className="min-w-0 leading-tight">
                                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                                <p className="type-caption text-white/60">{isSuperAdmin ? 'SuperAdmin' : 'User'}</p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {user ? (
                            <>
                                <NavBtn href="/dashboard" current={current} onGo={close} tone="solid">Dashboard</NavBtn>
                                {isSuperAdmin && (
                                    <NavBtn href="/users" current={current} onGo={close} tone="solid">Pengguna</NavBtn>
                                )}
                                <NavBtn href="/profile" current={current} onGo={close} tone="violet">Profil</NavBtn>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    onClick={close}
                                    className="btn btn-sm border border-white/30 bg-transparent font-semibold text-white"
                                >
                                    Keluar
                                </Link>
                            </>
                        ) : (
                            <>
                                <NavBtn href="/login" current={current} onGo={close} tone="solid">Masuk</NavBtn>
                                <NavBtn href="/register" current={current} onGo={close} tone="amber">Daftar</NavBtn>
                            </>
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
