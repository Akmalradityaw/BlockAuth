import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import { toast } from '@/Components/feedback/Toast';
import { hideLoading, showLoading } from '@/Components/feedback/LoadingOverlay';

const PROVIDERS = [
    { key: 'google', label: 'Google OAuth', desc: 'Tombol Masuk dengan Google di halaman login dan daftar.' },
    { key: 'github', label: 'GitHub OAuth', desc: 'Tombol Masuk dengan GitHub di halaman login dan daftar.' },
];

export default function SettingsIndex({
    toggles = {},
    maintenance = false,
    banner = '',
    banner_enabled = false,
    banner_style = 'warning',
    password_policy = {},
    brute_force = { max_attempts: 5, decay_minutes: 1 },
    stats = {},
}) {
    const [values, setValues] = useState({
        google: !!toggles.google,
        github: !!toggles.github,
        must_verify_email: !!toggles.must_verify_email,
    });
    const [saving, setSaving] = useState({});
    const lastFire = useRef({});

    const [bannerText, setBannerText] = useState(banner || '');
    const [bannerStyle, setBannerStyle] = useState(banner_style || 'warning');
    const [isBannerEnabled, setIsBannerEnabled] = useState(!!banner_enabled);
    const [isMaintenance, setIsMaintenance] = useState(!!maintenance);

    const [policy, setPolicy] = useState(password_policy || {
        min_length: 8,
        require_uppercase: true,
        require_numeric: true,
        require_special_char: false,
    });
    const [savingPolicy, setSavingPolicy] = useState(false);

    const [bfState, setBfState] = useState({
        max_attempts: brute_force.max_attempts || 5,
        decay_minutes: brute_force.decay_minutes || 1,
    });
    const [savingBf, setSavingBf] = useState(false);

    useEffect(() => {
        setValues({
            google: !!toggles.google,
            github: !!toggles.github,
            must_verify_email: !!toggles.must_verify_email,
        });
    }, [toggles.google, toggles.github, toggles.must_verify_email]);

    useEffect(() => {
        setIsMaintenance(!!maintenance);
        setIsBannerEnabled(!!banner_enabled);
    }, [maintenance, banner_enabled]);

    function executeToggle(key, enabled, loadingText, successText, revertCallback) {
        if (saving[key]) return;
        setSaving((s) => ({ ...s, [key]: true }));
        showLoading(loadingText);

        axios.put('/settings/toggle', { key, value: enabled })
            .then(() => {
                toast.success(successText);
            })
            .catch((err) => {
                revertCallback();
                const msg = err.response?.data?.message || 'Gagal mengubah pengaturan.';
                toast.error(msg);
            })
            .finally(() => {
                setSaving((s) => ({ ...s, [key]: false }));
                hideLoading();
            });
    }

    function flip(provider, enabled) {
        const now = Date.now();
        if (now - (lastFire.current[provider] || 0) < 400) return;
        lastFire.current[provider] = now;

        setValues((v) => ({ ...v, [provider]: enabled }));
        const label = PROVIDERS.find((p) => p.key === provider)?.label || provider;

        executeToggle(
            `auth.${provider}`,
            enabled,
            `Menyimpan pengaturan ${label}...`,
            `${label} ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`,
            () => setValues((v) => ({ ...v, [provider]: !enabled }))
        );
    }

    function flipMaintenance(enabled) {
        setIsMaintenance(enabled);
        executeToggle(
            'maintenance.enabled',
            enabled,
            'Mengubah mode pemeliharaan sistem...',
            `Mode pemeliharaan sistem ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`,
            () => setIsMaintenance(!enabled)
        );
    }

    function flipBanner(enabled) {
        setIsBannerEnabled(enabled);
        executeToggle(
            'banner.enabled',
            enabled,
            'Mengubah status pengumuman banner...',
            `Pengumuman banner ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`,
            () => setIsBannerEnabled(!enabled)
        );
    }

    function flipEmailVerification(enabled) {
        setValues((v) => ({ ...v, must_verify_email: enabled }));
        executeToggle(
            'auth.must_verify_email',
            enabled,
            'Menyimpan mode verifikasi email...',
            `Wajib verifikasi email ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`,
            () => setValues((v) => ({ ...v, must_verify_email: !enabled }))
        );
    }

    function saveBannerText(e) {
        e.preventDefault();
        showLoading('Menyimpan pesan banner...');
        router.put('/settings/banner', {
            text: bannerText,
            style: bannerStyle,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Pesan dan gaya banner diperbarui.'),
            onError: () => toast.error('Gagal menyimpan pesan banner.'),
            onFinish: () => hideLoading(),
        });
    }

    function savePasswordPolicy(e) {
        e.preventDefault();
        setSavingPolicy(true);
        showLoading('Menyimpan kebijakan sandi...');
        router.put('/settings/password-policy', policy, {
            preserveScroll: true,
            onSuccess: () => toast.success('Kebijakan kata sandi berhasil disimpan.'),
            onError: () => toast.error('Gagal menyimpan kebijakan sandi.'),
            onFinish: () => {
                setSavingPolicy(false);
                hideLoading();
            },
        });
    }

    function saveBruteForce(e) {
        e.preventDefault();
        setSavingBf(true);
        showLoading('Menyimpan proteksi brute force...');
        router.put('/settings/brute-force', bfState, {
            preserveScroll: true,
            onSuccess: () => toast.success('Konfigurasi brute force berhasil disimpan.'),
            onError: () => toast.error('Gagal menyimpan konfigurasi brute force.'),
            onFinish: () => {
                setSavingBf(false);
                hideLoading();
            },
        });
    }

    return (
        <AppLayout
            eyebrow="Sistem"
            title="Pengaturan Sistem"
            desc="Kelola provider autentikasi, kebijakan keamanan sandi, proteksi brute force, serta akses langsung ke modul keamanan operasional."
            actions={
                <div className="flex flex-wrap items-center gap-2">
                    <Link href="/roles/permissions" className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]">
                        Matriks Akses
                    </Link>
                    <Link href="/security/ip-rules" className="btn btn-sm btn-outline border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Firewall IP
                    </Link>
                    <Link href="/security/sessions" className="btn btn-sm btn-outline border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Sesi Global
                    </Link>
                    <Link href="/developer/webhooks" className="btn btn-sm btn-outline border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Webhooks
                    </Link>
                    <Link href="/announcements" className="btn btn-sm btn-outline border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Broadcast
                    </Link>
                </div>
            }
        >
            <Head title="Pengaturan Sistem" />

            {/* Bagian 1: Hub Navigasi Cepat Modul Keamanan & Integrasi */}
            <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Pusat Modul Keamanan & Integrasi Khusus
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Modul operasional kini memiliki konsol terpisah lengkap dengan DataTable interaktif, filter multi-kriteria, dan metrik analitik.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Firewall & Aturan IP */}
                    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </span>
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                    {stats.ip_rules_active ?? 0} Aktif
                                </span>
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                                Firewall & Aturan IP
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Daftar hitam (blacklist) dan putih (whitelist) alamat IP, auto-detect IP klien, dan pemblokiran bot.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href="/security/ip-rules"
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70"
                            >
                                Buka Konsol Firewall &rarr;
                            </Link>
                        </div>
                    </div>

                    {/* Card 2: Sesi Aktif Global */}
                    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                                    Global
                                </span>
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                                Sesi Pengguna Global
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Pantau perangkat login di seluruh sistem, deteksi browser, IP, dan eksekusi pemutusan paksa (force logout).
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href="/security/sessions"
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
                            >
                                Buka Sesi Global &rarr;
                            </Link>
                        </div>
                    </div>

                    {/* Card 3: Webhooks & Event */}
                    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </span>
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    {stats.webhooks_active ?? 0} Aktif
                                </span>
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                                Webhooks & API Event
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Integrasi HTTP POST bertanda tangan HMAC-SHA256, uji coba ping event, dan inspeksi log respon status server.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href="/developer/webhooks"
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
                            >
                                Buka Konsol Webhooks &rarr;
                            </Link>
                        </div>
                    </div>

                    {/* Card 4: Broadcast & Pengumuman */}
                    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                </span>
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                    {stats.announcements_active ?? 0} Aktif
                                </span>
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                                Pengumuman Broadcast
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Siaran pesan ke seluruh akun dengan kategori informasi, penanda penting (pinned), serta pelacakan jumlah pembaca.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href="/announcements"
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/70"
                            >
                                Buka Konsol Broadcast &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bagian 2: Pengaturan Kebijakan Otentikasi & Registrasi */}
            <div className="grid gap-4 lg:grid-cols-2">
                {PROVIDERS.map((p) => {
                    const isOn = values[p.key];
                    const isSaving = !!saving[p.key];

                    return (
                        <section key={p.key} className="card-shell p-4 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">{p.label}</h2>
                                    <p className="type-small mt-1 text-[#334155] dark:text-slate-400">{p.desc}</p>
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
                            <p className="type-small mt-3 flex items-center gap-2 text-[#334155] dark:text-slate-400">
                                {isSaving && <span className="loading loading-spinner loading-xs" />}
                                Status: {isOn ? 'Aktif' : 'Nonaktif'}
                                {isSaving && <span className="text-slate-400 dark:text-slate-500">&middot; menyimpan...</span>}
                            </p>
                        </section>
                    );
                })}

                <section className="card-shell p-4 sm:p-6 lg:col-span-2 border-l-4 border-violet-500">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Wajibkan Verifikasi Email (Strict Verification)</h2>
                            <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                                Saat diaktifkan, pengguna baru tidak dapat mengakses sistem sebelum memverifikasi alamat email mereka melalui tautan aktivasi.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle border-slate-400 bg-slate-200 checked:border-[#6D28D9] checked:bg-[#6D28D9]"
                            checked={values.must_verify_email}
                            disabled={!!saving['auth.must_verify_email']}
                            onChange={(e) => flipEmailVerification(e.target.checked)}
                            aria-label="Wajibkan verifikasi email"
                        />
                    </div>
                    <p className="type-small mt-3 flex items-center gap-2 text-[#334155] dark:text-slate-400">
                        {saving['auth.must_verify_email'] && <span className="loading loading-spinner loading-xs" />}
                        Status: {values.must_verify_email ? 'Wajib Verifikasi' : 'Bebas Masuk (Opsional)'}
                        {saving['auth.must_verify_email'] && <span className="text-slate-400 dark:text-slate-500">&middot; menyimpan...</span>}
                    </p>
                </section>
            </div>

            {/* Bagian 3: Proteksi Serangan Brute Force */}
            <section className="card-shell mt-4 p-4 sm:p-6 border-l-4 border-rose-500">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Proteksi Serangan Brute Force</h2>
                        <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                            Batasi percobaan login yang gagal untuk mencegah serangan brute force dan pengambilalihan akun secara otomatis.
                        </p>
                    </div>
                </div>

                <form onSubmit={saveBruteForce} className="mt-4 flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">Maksimal Percobaan Gagal</label>
                            <input
                                type="number"
                                min={3}
                                max={20}
                                value={bfState.max_attempts}
                                onChange={(e) => setBfState({ ...bfState, max_attempts: parseInt(e.target.value) || 5 })}
                                className="input input-sm input-bordered mt-1 w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                            />
                            <span className="type-caption text-slate-400 dark:text-slate-500">Rentang yang diizinkan: 3 - 20 kali percobaan.</span>
                        </div>
                        <div>
                            <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">Durasi Penguncian (Menit)</label>
                            <input
                                type="number"
                                min={1}
                                max={60}
                                value={bfState.decay_minutes}
                                onChange={(e) => setBfState({ ...bfState, decay_minutes: parseInt(e.target.value) || 1 })}
                                className="input input-sm input-bordered mt-1 w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                            />
                            <span className="type-caption text-slate-400 dark:text-slate-500">Rentang penguncian: 1 - 60 menit.</span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={savingBf}
                            className="btn btn-sm btn-brand border-0"
                        >
                            {savingBf ? 'Menyimpan...' : 'Simpan Konfigurasi Brute Force'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Bagian 4: Kebijakan Kata Sandi */}
            <section className="card-shell mt-4 p-4 sm:p-6 border-l-4 border-indigo-500">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Kebijakan Kompleksitas Kata Sandi</h2>
                        <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                            Tentukan standar keamanan minimal untuk setiap kata sandi pengguna baru maupun perubahan sandi profil.
                        </p>
                    </div>
                </div>

                <form onSubmit={savePasswordPolicy} className="mt-4 flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">Panjang Minimal Karakter</label>
                            <input
                                type="number"
                                min={6}
                                max={32}
                                value={policy.min_length}
                                onChange={(e) => setPolicy({ ...policy, min_length: parseInt(e.target.value) || 8 })}
                                className="input input-sm input-bordered mt-1 w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                            />
                            <span className="type-caption text-slate-400 dark:text-slate-500">Disarankan minimal 8 karakter.</span>
                        </div>

                        <div className="flex flex-col justify-center gap-2 pt-2 sm:pt-4">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm checkbox-primary"
                                    checked={policy.require_uppercase}
                                    onChange={(e) => setPolicy({ ...policy, require_uppercase: e.target.checked })}
                                />
                                <span className="type-small font-medium text-slate-700 dark:text-slate-300">Wajib Huruf Besar (A-Z)</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm checkbox-primary"
                                    checked={policy.require_numeric}
                                    onChange={(e) => setPolicy({ ...policy, require_numeric: e.target.checked })}
                                />
                                <span className="type-small font-medium text-slate-700 dark:text-slate-300">Wajib Angka (0-9)</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm checkbox-primary"
                                    checked={policy.require_special_char}
                                    onChange={(e) => setPolicy({ ...policy, require_special_char: e.target.checked })}
                                />
                                <span className="type-small font-medium text-slate-700 dark:text-slate-300">Wajib Simbol / Karakter Khusus (!@#$%^&*)</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={savingPolicy}
                            className="btn btn-sm btn-brand border-0"
                        >
                            {savingPolicy ? 'Menyimpan...' : 'Simpan Kebijakan Sandi'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Bagian 5: Mode Pemeliharaan & Banner Darurat Global */}
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <section className="card-shell p-4 sm:p-6 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Mode Pemeliharaan (Maintenance)</h2>
                            <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                                Batasi akses seluruh sistem hanya untuk SuperAdmin saat proses pemeliharaan database atau update besar.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle border-slate-400 bg-slate-200 checked:border-[#6D28D9] checked:bg-[#6D28D9]"
                            checked={isMaintenance}
                            disabled={!!saving['maintenance.enabled']}
                            onChange={(e) => flipMaintenance(e.target.checked)}
                            aria-label="Mode pemeliharaan"
                        />
                    </div>
                    <p className="type-small mt-3 flex items-center gap-2 text-[#334155] dark:text-slate-400">
                        {saving['maintenance.enabled'] && <span className="loading loading-spinner loading-xs" />}
                        Status: {isMaintenance ? 'Sistem Terkunci (Maintenance)' : 'Beroperasi Normal'}
                        {saving['maintenance.enabled'] && <span className="text-slate-400 dark:text-slate-500">&middot; menyimpan...</span>}
                    </p>
                </section>

                <section className="card-shell p-4 sm:p-6 border-l-4 border-cyan-500">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Banner Pengumuman Darurat Global</h2>
                            <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                                Aktifkan banner peringatan yang akan langsung muncul di bar paling atas seluruh halaman aplikasi.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle border-slate-400 bg-slate-200 checked:border-[#6D28D9] checked:bg-[#6D28D9]"
                            checked={isBannerEnabled}
                            disabled={!!saving['banner.enabled']}
                            onChange={(e) => flipBanner(e.target.checked)}
                            aria-label="Pengumuman banner"
                        />
                    </div>
                    <p className="type-small mt-3 flex items-center gap-2 text-[#334155] dark:text-slate-400">
                        {saving['banner.enabled'] && <span className="loading loading-spinner loading-xs" />}
                        Status: {isBannerEnabled ? 'Banner Tampil di Layar' : 'Disembunyikan'}
                        {saving['banner.enabled'] && <span className="text-slate-400 dark:text-slate-500">&middot; menyimpan...</span>}
                    </p>
                </section>
            </div>

            {/* Bagian 6: Konfigurasi Pesan Banner Darurat */}
            <section className="card-shell mt-4 p-4 sm:p-6">
                <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Pengaturan Teks & Gaya Banner</h2>
                <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                    Kustomisasi pesan yang disiarkan pada banner darurat beserta tingkat urgensi gayanya.
                </p>

                <form onSubmit={saveBannerText} className="mt-4 flex flex-col gap-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">Isi Pesan Banner</label>
                            <input
                                type="text"
                                maxLength={200}
                                placeholder="Contoh: Pemeliharaan server dijadwalkan malam ini pukul 23:00 WIB."
                                value={bannerText}
                                onChange={(e) => setBannerText(e.target.value)}
                                className="input input-sm input-bordered mt-1 w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                            />
                        </div>
                        <div>
                            <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">Gaya Tampilan (Urgensi)</label>
                            <select
                                value={bannerStyle}
                                onChange={(e) => setBannerStyle(e.target.value)}
                                className="select select-sm select-bordered mt-1 w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                            >
                                <option value="info">Info (Biru)</option>
                                <option value="warning">Peringatan (Kuning Amber)</option>
                                <option value="critical">Kritis / Darurat (Merah)</option>
                            </select>
                        </div>
                    </div>

                    {bannerText && (
                        <div className="mt-2 rounded-xl border border-dashed border-slate-200 p-3 dark:border-slate-800">
                            <span className="type-caption font-semibold text-slate-500 dark:text-slate-400">Pratinjau Banner:</span>
                            <div className={`mt-1.5 flex items-center justify-between rounded-lg px-4 py-2 text-xs font-semibold ${
                                bannerStyle === 'critical'
                                    ? 'bg-rose-500 text-white'
                                    : bannerStyle === 'info'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-amber-400 text-slate-900'
                            }`}>
                                <span>{bannerText}</span>
                                <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                                    {bannerStyle}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button type="submit" className="btn btn-sm btn-brand border-0">
                            Simpan Perubahan Banner
                        </button>
                    </div>
                </form>
            </section>
        </AppLayout>
    );
}
