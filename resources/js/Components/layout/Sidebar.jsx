import { Link, usePage } from '@inertiajs/react';
import { getVisibleNavItems } from '@/lib/navigation';
import { isActive } from '@/lib/ui';

function Mark({ letter, active }) {
    return (
        <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold transition-colors ${
                active ? 'bg-[#F59E0B] text-[#1E1B4B]' : 'bg-white/10 text-white'
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
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                active ? 'bg-white text-[#1E1B4B]' : 'text-white/75 hover:bg-white/10 hover:text-white'
            } ${collapsed ? 'justify-center px-0' : ''}`}
        >
            <Mark letter={mark} active={active} />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}

export default function Sidebar({ mode = 'expanded', collapsed, onToggleMinimize, onToggle, onNavigate, open }) {
    const { auth, features = {}, app = {} } = usePage().props;
    const appName = app?.name || 'BlockAuth';
    const appTagline = app?.tagline || 'Auth dan Profil';
    const appLogo = app?.logo_url;

    const perms = auth?.permissions || [];
    const isSuperAdmin = Boolean(auth?.roles?.includes('SuperAdmin'));
    const current = usePage().url;

    const isRail = mode === 'rail' || Boolean(collapsed);
    const isHidden = mode === 'hidden';

    const handleMinimize = onToggleMinimize || onToggle;
    const navItems = getVisibleNavItems(perms, features, isSuperAdmin);

    const widthClass = isRail ? 'w-20' : 'w-72';
    const visibilityClass = open
        ? 'translate-x-0'
        : isHidden
        ? '-translate-x-full pointer-events-none'
        : 'max-lg:-translate-x-full lg:translate-x-0';

    return (
        <aside
            aria-hidden={isHidden ? 'true' : undefined}
            className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col overflow-hidden bg-[#1E1B4B] text-white transition-all duration-300 ${visibilityClass} ${widthClass}`}
        >
            <div className={`flex shrink-0 items-center gap-2.5 p-4 ${isRail ? 'flex-col justify-center' : ''}`}>
                {appLogo ? (
                    <img
                        src={appLogo}
                        alt={appName}
                        className="h-9 w-9 shrink-0 rounded-lg object-contain bg-white p-0.5"
                    />
                ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B] text-lg font-extrabold text-[#1E1B4B]">
                        {appName.charAt(0).toUpperCase()}
                    </span>
                )}
                {!isRail && (
                    <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-base font-bold tracking-tight">{appName}</span>
                        <span className="type-caption block text-white/60">{appTagline}</span>
                    </span>
                )}
                <button
                    type="button"
                    onClick={handleMinimize}
                    aria-label={isRail ? 'Perluas sidebar penuh' : 'Ciutkan sidebar jadi ikon (Mini-Rail)'}
                    title={isRail ? 'Perluas sidebar penuh' : 'Ciutkan sidebar jadi ikon (Mini-Rail)'}
                    className="btn btn-xs hidden border border-white/20 bg-transparent text-white hover:bg-white/10 lg:inline-flex"
                >
                    {isRail ? '»' : '«'}
                </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {navItems.map((item) => {
                    if (item.type === 'single') {
                        return (
                            <Item
                                key={item.href}
                                {...item}
                                current={current}
                                onGo={onNavigate}
                                collapsed={isRail}
                            />
                        );
                    }

                    if (item.type === 'group') {
                        const isGroupActive = item.children.some((child) => isActive(current, child.href));

                        if (isRail) {
                            return item.children.map((child) => (
                                <Item
                                    key={child.href}
                                    {...child}
                                    current={current}
                                    onGo={onNavigate}
                                    collapsed
                                />
                            ));
                        }

                        return (
                            <details key={item.label} className="group" open={isGroupActive ? true : undefined}>
                                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">
                                    <Mark letter={item.label.charAt(0)} active={isGroupActive} />
                                    <span className="flex-1 truncate">{item.label}</span>
                                    <span className="text-xs text-white/50 transition-transform group-open:rotate-90">›</span>
                                </summary>
                                <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-white/15 pl-3">
                                    {item.children.map((child) => (
                                        <Item
                                            key={child.href}
                                            {...child}
                                            current={current}
                                            onGo={onNavigate}
                                            collapsed={false}
                                        />
                                    ))}
                                </div>
                            </details>
                        );
                    }

                    return null;
                })}
            </nav>
        </aside>
    );
}
