import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/layout/Navbar';
import { SectionTitle } from '@/Components/data/Ui';

const features = [
    { title: 'Auth lengkap', desc: 'Registrasi, login session, reset via email, dan logout aman.' },
    { title: 'OAuth sosial', desc: 'Google dan GitHub dengan tautan otomatis ke email yang sama.' },
    { title: 'Profil modular', desc: 'Data diri, bio, avatar 300x300, dan password terpisah.' },
    { title: 'Role jelas', desc: 'SuperAdmin kelola pengguna, User kelola profil sendiri.' },
    { title: 'Desain solid', desc: 'Indigo, violet, dan amber. Kontras tinggi dan konsisten.' },
    { title: 'Responsif penuh', desc: 'Tabel jadi kartu di HP, navigasi hamburger, dan tipe skala.' },
];

export default function Welcome() {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Head title="Selamat Datang" />
            <Navbar />
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
                <section className="card-shell grid gap-6 p-5 sm:p-8 lg:grid-cols-2 lg:items-center">
                    <div>
                        <p className="type-caption text-[#6D28D9]">Laravel 12 + Inertia React</p>
                        <h1 className="type-display mt-2 text-[#1E1B4B]">BlockAuth v2 dengan tipografi responsif</h1>
                        <p className="type-small mt-3 max-w-xl text-[#334155] sm:text-base">
                            Modul autentikasi dan profil yang bersih. Warna solid indigo dan amber,
                            hierarki teks yang jelas, dan tata letak yang rapi dari HP sampai desktop.
                        </p>
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                            <Link href="/register" className="btn btn-brand border-0 sm:w-auto">
                                Mulai Daftar
                            </Link>
                            <Link href="/login" className="btn border border-slate-300 bg-white text-[#1E1B4B] sm:w-auto">
                                Masuk
                            </Link>
                            <Link href="/users" className="btn border-0 bg-[#F59E0B] text-[#1E1B4B] sm:w-auto">
                                Lihat Pengguna
                            </Link>
                        </div>
                        <dl className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="rounded-xl bg-[#EEF2FF] p-2 text-center sm:p-3">
                                <dt className="type-caption text-[#334155]">Auth</dt>
                                <dd className="mt-0.5 text-base font-bold text-[#1E1B4B] sm:text-xl">6 alur</dd>
                            </div>
                            <div className="rounded-xl bg-[#EEF2FF] p-2 text-center sm:p-3">
                                <dt className="type-caption text-[#334155]">Profil</dt>
                                <dd className="mt-0.5 text-base font-bold text-[#1E1B4B] sm:text-xl">3 modul</dd>
                            </div>
                            <div className="rounded-xl bg-[#EEF2FF] p-2 text-center sm:p-3">
                                <dt className="type-caption text-[#334155]">Role</dt>
                                <dd className="mt-0.5 text-base font-bold text-[#1E1B4B] sm:text-xl">2 peran</dd>
                            </div>
                        </dl>
                    </div>
                    <div className="rounded-2xl bg-[#1E1B4B] p-5 text-white sm:p-6">
                        <p className="type-caption text-[#F59E0B]">Skala tipe</p>
                        <p className="type-display mt-1">Display tegas</p>
                        <p className="type-h1 mt-2">H1 untuk judul halaman</p>
                        <p className="type-h2 mt-2">H2 untuk judul kartu</p>
                        <p className="type-small mt-2 text-white/80">
                            Body 16px dengan line height 1.6 agar nyaman dibaca di layar kecil maupun besar.
                        </p>
                        <p className="type-caption mt-3 text-white/60">Caption untuk label dan eyebrow</p>
                    </div>
                </section>
                <section className="mt-6">
                    <SectionTitle
                        eyebrow="Fitur"
                        title="Semua yang dibutuhkan modul auth"
                        desc="Enam kartu fitur yang tersusun 1 kolom di HP, 2 kolom di tablet, dan 3 kolom di desktop."
                    />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <article key={f.title} className="card-shell p-5">
                                <h3 className="type-h2 text-[#1E1B4B]">{f.title}</h3>
                                <p className="type-small mt-1 text-[#334155]">{f.desc}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
            <footer className="bg-[#1E1B4B] text-white">
                <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6">
                    <span className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F59E0B] text-sm font-extrabold text-[#1E1B4B]">
                            B
                        </span>
                        <span className="text-sm font-bold">BlockAuth</span>
                    </span>
                    <span className="type-small text-white/60">Solid indigo, violet, dan amber. Tanpa efek berlebih.</span>
                </div>
            </footer>
        </div>
    );
}
