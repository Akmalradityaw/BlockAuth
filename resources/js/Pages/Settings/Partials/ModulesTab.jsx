import { useState } from 'react';
import { router } from '@inertiajs/react';
import SolidButton from '@/Components/ui/SolidButton';
import BrandingSection from './BrandingSection';

export default function ModulesTab({ features = {}, app = {} }) {
    const [data, setData] = useState({
        // Identitas & Branding UI
        app_name: app?.name || 'BlockAuth',
        app_tagline: app?.tagline || 'Auth dan Profil',
        app_logo_url: app?.logo_url || '',
        app_logo_file: null,
        remove_logo: false,
        app_footer_text: app?.footer_text || `© ${new Date().getFullYear()} ${app?.name || 'BlockAuth'}. All rights reserved.`,
        // Modul Halaman
        users: Boolean(features.users ?? true),
        roles: Boolean(features.roles ?? true),
        audit_logs: Boolean(features.audit_logs ?? true),
        registration: Boolean(features.registration ?? true),
        magic_link: Boolean(features.magic_link ?? true),
    });

    const [logoPreview, setLogoPreview] = useState(app?.logo_url || null);
    const [pickedFile, setPickedFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);

        router.post('/settings/modules', {
            ...data,
            _method: 'put',
        }, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setPickedFile(null);
            },
        });
    }

    const modulesList = [
        {
            key: 'users',
            title: 'Manajemen Pengguna (/users)',
            desc: 'Akses daftar pengguna, penambahan akun, pengubahan role, serta fitur ekspor CSV.',
            badge: 'Data Akun',
        },
        {
            key: 'roles',
            title: 'Matriks Akses & Hak Peran (/roles/permissions)',
            desc: 'Pengaturan izin granular (permissions) dan pemetaan hak akses berbasis peran Spatie.',
            badge: 'RBAC',
        },
        {
            key: 'audit_logs',
            title: 'Log Audit Sistem (/audit-logs)',
            desc: 'Pelacakan riwayat aktivitas penting (login, perubahan data, pengaturan sistem) untuk kebutuhan keamanan.',
            badge: 'Audit Trail',
        },
        {
            key: 'registration',
            title: 'Pendaftaran Akun Publik (/register)',
            desc: 'Buka atau tutup form registrasi untuk pengguna umum. Jika dimatikan, hanya admin yang dapat membuat akun.',
            badge: 'Autentikasi',
        },
        {
            key: 'magic_link',
            title: 'Login Magic Link Passwordless (/magic-link)',
            desc: 'Autentikasi tanpa kata sandi via tautan sekali pakai yang dikirimkan ke email terdaftar.',
            badge: 'Passwordless',
        },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <h2 className="type-h2 text-[#1E1B4B]">Kustomisasi Tampilan & Modul Halaman</h2>
                    <p className="type-small mt-1 text-[#334155]">
                        Ubah identitas aplikasi (logo, nama, slogan, teks footer) dan kelola ketersediaan modul halaman sistem secara terpusat.
                    </p>
                </div>
                <SolidButton
                    type="submit"
                    processing={processing}
                    fullWidth={false}
                    variant="primary"
                    className="btn-sm shrink-0"
                >
                    Simpan Perubahan UI
                </SolidButton>
            </div>

            {/* Bagian 1: Identitas & Branding UI (Upload Logo, Nama, dsb) */}
            <BrandingSection
                data={data}
                setData={setData}
                logoPreview={logoPreview}
                setLogoPreview={setLogoPreview}
                pickedFile={pickedFile}
                setPickedFile={setPickedFile}
            />

            {/* Bagian 2: Ketersediaan Modul Halaman */}
            <div className="space-y-4">
                <div>
                    <h3 className="type-h3 text-[#1E1B4B]">Ketersediaan Modul Halaman (Feature Flags)</h3>
                    <p className="type-caption text-slate-500">
                        Modul yang dinonaktifkan akan otomatis disembunyikan dari sidebar dan akses URL langsung akan dicegat.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {modulesList.map((m) => {
                        const isEnabled = data[m.key];

                        return (
                            <div
                                key={m.key}
                                className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                                    isEnabled
                                        ? 'border-slate-200 bg-white shadow-sm'
                                        : 'border-slate-200 bg-slate-50 opacity-80'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <h4 className="type-h3 text-[#1E1B4B]">{m.title}</h4>
                                            <span className="badge badge-sm border-0 bg-slate-200 text-xs font-semibold text-slate-700">
                                                {m.badge}
                                            </span>
                                        </div>
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={isEnabled}
                                                onChange={(e) => setData({ ...data, [m.key]: e.target.checked })}
                                                className="toggle toggle-primary toggle-sm"
                                            />
                                            <span className={`text-xs font-bold ${isEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {isEnabled ? 'Aktif' : 'Mati'}
                                            </span>
                                        </label>
                                    </div>
                                    <p className="type-small mt-2 text-[#334155]">{m.desc}</p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                    <span>Status Menu Sidebar:</span>
                                    <span className={isEnabled ? 'font-semibold text-emerald-600' : 'text-slate-400'}>
                                        {isEnabled ? 'Tampil di Navigasi' : 'Disembunyikan'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
                <p className="type-small font-semibold text-blue-900">Catatan Keamanan SuperAdmin:</p>
                <p className="type-small mt-1 text-blue-800">
                    Halaman <strong>Pengaturan Sistem</strong> dan <strong>Dashboard</strong> dirancang permanen aktif agar SuperAdmin dapat selalu mengelola konfigurasi dan menyalakan kembali modul kapan saja.
                </p>
            </div>
        </form>
    );
}
