import { Link, usePage } from '@inertiajs/react';
import { can } from '@/lib/can';
import { isActive } from '@/lib/ui';

function Mark({ letter, active }) {
    return (
        <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold transition-colors ${active ? 'bg-[#F59E0B] text-[#1E1B4B]' : 'bg-white/10 text-white'
                }`}
        >
            {letter}
        </span>
    );
}

function Item({ href, label, mark, current, onGo, collapsed }) {
    const active = isActive(current, href);
    return (
        <Link
            href={href}
            onClick={onGo}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${active ? 'bg-white text-[#1E1B4B]' : 'text-white/75 hover:bg-white/10 hover:text-white'
                } ${collapsed ? 'justify-center px-0' : ''}`}
        >
            <Mark letter={mark} active={active} />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}

export default function Sidebar({ collapsed, onToggle, onNavigate, open }) {
    const { auth } = usePage().props;
    const perms = auth?.permissions || [];
    const current = usePage().url;

    const showUsers = can(perms, 'users:read');
    const showAccess = can(perms, 'roles:manage');
    const showSettings = can(perms, 'settings:read');
    const showKelola = showUsers || showAccess;
    const kelolaOpen = isActive(current, '/users') || isActive(current, '/roles/permissions');

    const kelolaChildren = [
        showUsers && { href: '/users', label: 'Pengguna', mark: 'P' },
        showAccess && { href: '/roles/permissions', label: 'Matriks Akses', mark: 'A' },
    ].filter(Boolean);

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col bg-[#1E1B4B] text-white transition-all duration-300 ${open ? 'translate-x-0' : 'max-lg:-translate-x-full'
                } ${collapsed ? 'w-20' : 'w-72'}`}
        >
            {/* Header Sidebar */}
            <div className={`flex shrink-0 items-center gap-2.5 p-4 ${collapsed ? 'flex-col justify-center' : ''}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B] text-lg font-extrabold text-[#1E1B4B]">
                    B
                </span>
                {!collapsed && (
                    <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-base font-bold tracking-tight">BlockAuth</span>
                        <span className="type-caption block text-white/60">Auth dan Profil</span>
                    </span>
                )}
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
                    className="btn btn-xs hidden border border-white/20 bg-transparent text-white hover:bg-white/10 lg:inline-flex"
                >
                    {collapsed ? '»' : '«'}
                </button>
            </div>

            {/* Navigasi Menu */}
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-2 space-y-1">
                <Item href="/dashboard" label="Dashboard" mark="D" current={current} onGo={onNavigate} collapsed={collapsed} />

                {showKelola && !collapsed && (
                    <details className="group" open={kelolaOpen ? true : undefined}>
                        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">
                            <Mark letter="K" active={kelolaOpen} />
                            <span className="flex-1 truncate">Kelola</span>
                            <span className="text-xs text-white/50 transition-transform group-open:rotate-90">›</span>
                        </summary>
                        <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-white/15 pl-3">
                            {kelolaChildren.map((c) => (
                                <Item key={c.href} {...c} current={current} onGo={onNavigate} collapsed={false} />
                            ))}
                        </div>
                    </details>
                )}

                {showKelola && collapsed && kelolaChildren.map((c) => (
                    <Item key={c.href} {...c} current={current} onGo={onNavigate} collapsed />
                ))}

                {showSettings && (
                    <Item href="/settings" label="Pengaturan" mark="S" current={current} onGo={onNavigate} collapsed={collapsed} />
                )}
            </nav>
        </aside>
    );
}
