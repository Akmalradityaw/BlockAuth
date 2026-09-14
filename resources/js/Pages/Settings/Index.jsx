import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { toast } from '@/Components/feedback/Toast';
import { hideLoading, showLoading } from '@/Components/feedback/LoadingOverlay';

const PROVIDERS = [
    { key: 'google', label: 'Google OAuth', desc: 'Tombol Masuk dengan Google di halaman login dan daftar.' },
    { key: 'github', label: 'GitHub OAuth', desc: 'Tombol Masuk dengan GitHub di halaman login dan daftar.' },
];

export default function SettingsIndex({ toggles, maintenance, banner }) {
    const [values, setValues] = useState({
        google: !!toggles.google,
        github: !!toggles.github,
    });
    const [saving, setSaving] = useState({});
    // ponytail: debounce 1 detik + failsafe 8 detik agar picu berulang (klik ganda,
    // event ganda, tab ganda) tidak bisa menumpuk request; upgrade ke queue bila perlu.
    const lastFire = useRef({});

    function clearSaving(provider) {
        setSaving((s) => ({ ...s, [provider]: false }));
        hideLoading();
    }
    const [bannerText, setBannerText] = useState(banner || '');

    useEffect(() => {
        setValues({ google: !!toggles.google, github: !!toggles.github });
    }, [toggles.google, toggles.github]);

    function flip(provider, enabled) {
        const now = Date.now();
        if (saving[provider] || now - (lastFire.current[provider] || 0) < 1000) return;
        lastFire.current[provider] = now;
        const label = provider === 'google' ? 'Google' : 'GitHub';

        setValues((v) => ({ ...v, [provider]: enabled }));
        setSaving((s) => ({ ...s, [provider]: true }));
        showLoading(`Menyimpan ${label} OAuth...`);
        setTimeout(() => clearSaving(provider), 8000);

        router.put(
            '/settings',
            { provider, enabled },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${label} OAuth ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`, { duration: 5000 });
                },
                onError: () => {
                    setValues((v) => ({ ...v, [provider]: !enabled }));
                    toast.error(`Gagal memperbarui ${label} OAuth.`);
                },
                onFinish: () => {
                    clearSaving(provider);
                },
            }
        );
    }

    function flipMaintenance(enabled) {
        if (saving.maintenance) return;
        setSaving((s) => ({ ...s, maintenance: true }));
        showLoading(enabled ? 'Mengaktifkan maintenance...' : 'Menonaktifkan maintenance...');

        router.put(
            '/settings/maintenance',
            { enabled },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(enabled ? 'Maintenance mode aktif.' : 'Maintenance mode mati.');
                },
                onError: () => {
                    toast.error('Gagal mengubah maintenance mode.');
                },
                onFinish: () => {
                    setSaving((s) => ({ ...s, maintenance: false }));
                    hideLoading();
                },
            }
        );
    }

    function saveBanner(e) {
        e.preventDefault();
        showLoading('Menyimpan banner...');
        router.put(
            '/settings/banner',
            { text: bannerText },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Banner disimpan.'),
                onError: () => toast.error('Gagal menyimpan banner.'),
                onFinish: () => hideLoading(),
            }
        );
    }

    return (
        <AppLayout
            eyebrow="Sistem"
            title="Pengaturan"
            desc="Kelola provider login sosial dan matriks hak akses role."
            actions={
                <Link href="/roles/permissions" className="btn btn-sm border-0 bg-[#6D28D9] text-white">
                    Matriks Akses
                </Link>
            }
        >
            <Head title="Pengaturan" />

            <div className="grid gap-4 lg:grid-cols-2">
                {PROVIDERS.map((p) => {
                    const isOn = values[p.key];
                    const isSaving = !!saving[p.key];

                    return (
                        <section key={p.key} className="card-shell p-4 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="type-h2 text-[#1E1B4B]">{p.label}</h2>
                                    <p className="type-small mt-1 text-[#334155]">{p.desc}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="toggle border-slate-400 bg-slate-200 checked:border-[#6D28D9] checked:bg-[#6D28D9]"
                                    checked={isOn}
                                    disabled={isSaving}
                                    onChange={(e) => flip(p.key, e.target.checked)}
                                    aria-label={p.label}
                                />
                            </div>
                            <p className="type-small mt-3 flex items-center gap-2 text-[#334155]">
                                {isSaving && <span className="loading loading-spinner loading-xs" />}
                                Status: {isOn ? 'Aktif' : 'Nonaktif'}
                                {isSaving && <span className="text-slate-400">· menyimpan…</span>}
                            </p>
                        </section>
                    );
                })}
            </div>

            <section className="card-shell mt-4 p-4 sm:p-6">
                <h2 className="type-h2 text-[#1E1B4B]">Maintenance mode</h2>
                <p className="type-small mt-1 text-[#334155]">
                    Saat aktif, semua user kecuali SuperAdmin melihat halaman pemeliharaan.
                </p>
                <div className="mt-3 flex items-center gap-3">
                    <input
                        type="checkbox"
                        className="toggle border-slate-400 bg-slate-200 checked:border-[#6D28D9] checked:bg-[#6D28D9]"
                        checked={!!maintenance}
                        disabled={!!saving.maintenance}
                        onChange={(e) => flipMaintenance(e.target.checked)}
                        aria-label="Maintenance mode"
                    />
                    <span className="type-small text-[#334155]">
                        {maintenance ? 'Aktif' : 'Nonaktif'}
                        {saving.maintenance ? ' · menyimpan…' : ''}
                    </span>
                </div>
            </section>

            <section className="card-shell mt-4 p-4 sm:p-6">
                <h2 className="type-h2 text-[#1E1B4B]">Banner pengumuman</h2>
                <p className="type-small mt-1 text-[#334155]">
                    Tampil di semua halaman. Kosongkan untuk menyembunyikan.
                </p>
                <form onSubmit={saveBanner} className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                        type="text"
                        value={bannerText}
                        maxLength={200}
                        onChange={(e) => setBannerText(e.target.value)}
                        placeholder="Contoh: Deploy rutin jam 22.00"
                        className="input input-bordered input-brand w-full bg-white text-[#1E1B4B]"
                    />
                    <button type="submit" className="btn btn-brand shrink-0 border-0">
                        Simpan
                    </button>
                </form>
            </section>

            <section className="card-shell mt-4 p-4 sm:p-6">
                <h2 className="type-h2 text-[#1E1B4B]">Matriks permission</h2>
                <p className="type-small mt-1 text-[#334155]">
                    Atur aksi CRUD per resource untuk tiap role tanpa ubah kode.
                </p>
                <Link href="/roles/permissions" className="btn btn-brand mt-3 border-0 sm:w-auto">
                    Buka Matriks Akses
                </Link>
            </section>
        </AppLayout>
    );
}
