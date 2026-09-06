import { Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';

export default function AppLayout({ children, eyebrow, title, desc, actions }) {
    return (
        <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
                {(eyebrow || title || actions) && (
                    <div className="mb-6 border-b border-slate-200 pb-5">
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
            </main>
            <footer className="bg-[#1E1B4B] text-white">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
                    <span className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F59E0B] text-sm font-extrabold text-[#1E1B4B]">
                            B
                        </span>
                        <span className="text-sm font-bold">BlockAuth</span>
                        <span className="type-small text-white/60">Modul auth dan profil</span>
                    </span>
                    <span className="flex items-center gap-3 text-sm">
                        <Link href="/dashboard" className="text-white/70 hover:text-white">Dashboard</Link>
                        <Link href="/profile" className="text-white/70 hover:text-white">Profil</Link>
                        <span className="text-white/40">v2 solid</span>
                    </span>
                </div>
            </footer>
        </div>
    );
}
