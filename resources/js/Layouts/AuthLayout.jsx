import { Link } from '@inertiajs/react';

const highlights = [
    { title: 'Masuk cepat', desc: 'Session aman, ingat saya, dan proteksi throttle bawaan.' },
    { title: 'OAuth sosial', desc: 'Google dan GitHub dengan tautan akun otomatis.' },
    { title: 'Profil lengkap', desc: 'Bio, avatar 300x300, password, dan role pengguna.' },
];

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
    return (
        <div className="auth-split grid min-h-screen lg:grid-cols-2">
            <aside className="auth-brand-panel hidden flex-col justify-between p-8 lg:flex xl:p-12">
                <Link href="/" className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B] text-xl font-extrabold text-[#1E1B4B]">
                        B
                    </span>
                    <span className="text-lg font-bold">BlockAuth</span>
                </Link>
                <div>
                    <p className="type-caption text-[#F59E0B]">Modul autentikasi</p>
                    <h2 className="type-display mt-2">Kelola akses dengan rapi di semua ukuran layar.</h2>
                    <div className="mt-6 grid gap-3">
                        {highlights.map((item) => (
                            <div key={item.title} className="rounded-xl border border-white/15 p-4">
                                <p className="font-semibold">{item.title}</p>
                                <p className="type-small text-white/75">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="type-small text-white/60">Solid indigo, violet, dan amber. Tanpa efek berlebih.</p>
            </aside>
            <main className="flex items-center justify-center px-4 py-8 sm:px-8">
                <div className="auth-card card w-full max-w-md shadow-lg">
                    <div className="card-body p-5 sm:p-7">
                        <Link href="/" className="type-caption text-[#6D28D9] lg:hidden">
                            BlockAuth
                        </Link>
                        {eyebrow && <p className="type-caption text-[#6D28D9]">{eyebrow}</p>}
                        {title && <h1 className="type-h1 text-[#1E1B4B]">{title}</h1>}
                        {subtitle && <p className="type-small mb-4 mt-1 text-[#334155]">{subtitle}</p>}
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
