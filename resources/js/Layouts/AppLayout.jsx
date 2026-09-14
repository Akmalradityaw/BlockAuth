import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/layout/Sidebar';
import Topbar from '@/Components/layout/Topbar';
import Footer from '@/Components/layout/Footer';
import Toast from '@/Components/feedback/Toast';
import LoadingOverlay from '@/Components/feedback/LoadingOverlay';
import SwalHost from '@/Components/feedback/Swal';

export default function AppLayout({ children, eyebrow, title, desc, actions }) {
    const { banner } = usePage().props;
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
        <div className="min-h-screen bg-[#F8FAFC]">
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
                {banner ? (
                    <div className="bg-[#F59E0B] px-4 py-2 text-center text-sm font-semibold text-[#1E1B4B]">
                        {banner}
                    </div>
                ) : null}
                <Topbar onOpenMobile={() => setMobileOpen(true)} />

                <main className="flex-1 p-6 lg:p-10">
                    <div className="mx-auto w-full max-w-7xl">
                        {(eyebrow || title || actions) && (
                            <div className="mb-6 border-b border-slate-200 pb-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="min-w-0">
                                        {eyebrow && <p className="type-caption text-[#6D28D9]">{eyebrow}</p>}
                                        {title && <h1 className="type-h1 mt-1 text-[#1E1B4B]">{title}</h1>}
                                        {desc && <p className="type-small mt-1 max-w-2xl text-[#334155]">{desc}</p>}
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
