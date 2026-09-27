import { Link, usePage } from '@inertiajs/react';
import { can } from '@/lib/can';
import { isActive } from '@/lib/ui';

function NavItem({ href, label, icon, current, onGo, collapsed, badge, exact }) {
    const active = isActive(current, href, exact);

    return (
        <Link
            href={href}
            preserveScroll={true}
            onClick={onGo}
            title={collapsed ? label : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150 ${
                active
                    ? 'bg-white text-[#1E1B4B] shadow-sm dark:bg-slate-800 dark:text-slate-100'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
            } ${collapsed ? 'justify-center px-0' : ''}`}
        >
            <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    active
                        ? 'bg-[#F59E0B] text-[#1E1B4B]'
                        : 'bg-white/10 text-white/90 group-hover:bg-white/20 group-hover:text-white'
                }`}
            >
                {icon}
            </span>

            {!collapsed && (
                <div className="flex min-w-0 flex-1 items-center justify-between">
                    <span className="truncate">{label}</span>
                    {badge && (
                        <span className="ml-2 rounded-full bg-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold text-indigo-200">
                            {badge}
                        </span>
                    )}
                </div>
            )}
        </Link>
    );
}

function SectionHeading({ title, collapsed }) {
    if (collapsed) return <div className="my-2 border-t border-white/10" />;

    return (
        <div className="px-3 pt-4 pb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                {title}
            </p>
        </div>
    );
}

export default function Sidebar({ collapsed, onToggle, onNavigate, open }) {
    const { auth } = usePage().props;
    const perms = auth?.permissions || [];
    const current = usePage().url;

    const showUsers = can(perms, 'users:read');
    const showAccess = can(perms, 'roles:manage');
    const showAuditLogs = can(perms, 'audit_logs:read');
    const showSettings = can(perms, 'settings:read');

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col bg-[#1E1B4B] dark:bg-slate-950 border-r border-transparent dark:border-slate-800 text-white transition-all duration-300 ${
                open ? 'translate-x-0' : 'max-lg:-translate-x-full'
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
                        <span className="type-caption block text-white/60">Identity & Security</span>
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
            <nav scroll-region="true" className="min-h-0 flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {/* 1. Menu Utama */}
                <SectionHeading title="Utama" collapsed={collapsed} />
                <NavItem
                    href="/dashboard"
                    label="Dashboard"
                    current={current}
                    onGo={onNavigate}
                    collapsed={collapsed}
                    icon={
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    }
                />

                {/* 2. Identitas & Akses */}
                {(showUsers || showAccess || showSettings) && (
                    <>
                        <SectionHeading title="Identitas & Akses" collapsed={collapsed} />
                        {showUsers && (
                            <NavItem
                                href="/users"
                                label="Pengguna"
                                current={current}
                                onGo={onNavigate}
                                collapsed={collapsed}
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                }
                            />
                        )}
                        {showUsers && (
                            <NavItem
                                href="/organizations"
                                label="Organisasi & Tim"
                                current={current}
                                onGo={onNavigate}
                                collapsed={collapsed}
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                }
                            />
                        )}
                        {showAccess && (
                            <NavItem
                                href="/roles/permissions"
                                label="Matriks Akses"
                                current={current}
                                onGo={onNavigate}
                                collapsed={collapsed}
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                }
                            />
                        )}
                        {showSettings && (
                            <NavItem
                                href="/security/sessions"
                                label="Sesi Global"
                                current={current}
                                onGo={onNavigate}
                                collapsed={collapsed}
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                            />
                        )}
                    </>
                )}

                {/* 3. Keamanan & Jaringan */}
                {(showSettings || showAuditLogs) && (
                    <>
                        <SectionHeading title="Keamanan & Jaringan" collapsed={collapsed} />
                        {showSettings && (
                            <NavItem
                                href="/security/ip-rules"
                                label="Aturan IP & Firewall"
                                current={current}
                                onGo={onNavigate}
                                collapsed={collapsed}
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                }
                            />
                        )}
                        {showSettings && (
                            <NavItem
                                href="/security/policies"
                                label="Kebijakan Akses"
                                current={current}
                                onGo={onNavigate}
                                collapsed={collapsed}
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            />
                        )}
                        {showSettings && (
                            <NavItem
                                href="/security/tickets"
                                label="Tiket Insiden"
                                current={current}
                                onGo={onNavigate}
                                collapsed={collapsed}
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                }
                            />
                        )}
                        {showAuditLogs && (
                            <NavItem
                                href="/audit-logs"
                                label="Log Aktivitas"
                                current={current}
                                onGo={onNavigate}
                                collapsed={collapsed}
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                }
                            />
                        )}
                    </>
                )}

                {/* 4. Integrasi & Komunikasi */}
                {showSettings && (
                    <>
                        <SectionHeading title="Integrasi & Siaran" collapsed={collapsed} />
                        <NavItem
                            href="/developer/oauth-clients"
                            label="Klien OAuth & SSO"
                            current={current}
                            onGo={onNavigate}
                            collapsed={collapsed}
                            icon={
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            }
                        />
                        <NavItem
                            href="/developer/webhooks"
                            label="Webhook Eksternal"
                            current={current}
                            onGo={onNavigate}
                            collapsed={collapsed}
                            icon={
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            }
                        />
                        <NavItem
                            href="/announcements"
                            label="Siaran Pengumuman"
                            current={current}
                            onGo={onNavigate}
                            collapsed={collapsed}
                            icon={
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            }
                        />
                    </>
                )}

                {/* 5. Sistem */}
                {showSettings && (
                    <>
                        <SectionHeading title="Sistem" collapsed={collapsed} />
                        <NavItem
                            href="/settings"
                            label="Pengaturan"
                            current={current}
                            onGo={onNavigate}
                            collapsed={collapsed}
                            exact={true}
                            icon={
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            }
                        />
                        <NavItem
                            href="/settings/email-templates"
                            label="Template Email"
                            current={current}
                            onGo={onNavigate}
                            collapsed={collapsed}
                            icon={
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                        />
                    </>
                )}
            </nav>
        </aside>
    );
}
