import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/layout/Sidebar';
import Topbar from '@/Components/layout/Topbar';
import Footer from '@/Components/layout/Footer';
import Toast from '@/Components/feedback/Toast';
import LoadingOverlay from '@/Components/feedback/LoadingOverlay';
import SwalHost from '@/Components/feedback/Swal';

export default function AppLayout({ children, eyebrow, title, desc, actions }) {
    const { banner, banner_style, is_impersonating, impersonator, auth } = usePage().props;
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem('sidebar-collapsed') === '1';
        } catch {
            return false;
        }
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    function toggle() {
        setCollapsed((v) => {
            const next = !v;
            try {
                localStorage.setItem('sidebar-collapsed', next ? '1' : '0');
            } catch {
                // abaikan
            }
            return next;
        });
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#1E1B4B] dark:text-slate-100 transition-colors duration-150">
            <Toast />
            <LoadingOverlay />
            <SwalHost />

            <Sidebar
                collapsed={collapsed}
                onToggle={toggle}
                onNavigate={() => setMobileOpen(false)}
                open={mobileOpen}
            />

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className={`flex min-h-screen flex-col transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                {is_impersonating ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F59E0B] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1E1B4B] shadow-inner">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E1B4B] text-[10px] font-bold text-white">
                                !
                            </span>
                            <span>
                                Mode Impersonasi: Anda sedang mengakses sistem sebagai{' '}
                                <span className="font-bold underline">{auth?.user?.name}</span> ({auth?.user?.email}).
                                {impersonator ? ` (Administrator: ${impersonator.name})` : ''}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.post('/impersonate/leave')}
                            className="btn btn-xs border-0 bg-[#1E1B4B] text-white hover:bg-slate-800"
                        >
                            Kembali ke Akun Admin
                        </button>
                    </div>
                ) : null}

                {banner ? (
                    <div className={`px-4 py-2 text-center text-sm font-semibold ${
                        banner_style === 'info' ? 'bg-[#3B82F6] text-white' : 
                        banner_style === 'critical' ? 'bg-[#EF4444] text-white' : 
                        'bg-[#F59E0B] text-[#1E1B4B]'
                    }`}>
                        {banner}
                    </div>
                ) : null}
                <Topbar onOpenMobile={() => setMobileOpen(true)} />

                <main className="flex-1 p-6 lg:p-10">
                    <div className="mx-auto w-full max-w-7xl">
                        {(eyebrow || title || actions) && (
                            <div className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="min-w-0">
                                        {eyebrow && <p className="type-caption text-[#6D28D9] dark:text-violet-400">{eyebrow}</p>}
                                        {title && <h1 className="type-h1 mt-1 text-[#1E1B4B] dark:text-slate-100">{title}</h1>}
                                        {desc && <p className="type-small mt-1 max-w-2xl text-[#334155] dark:text-slate-400">{desc}</p>}
                                    </div>
                                    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
                                </div>
                            </div>
                        )}
                        {children}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
