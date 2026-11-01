import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from '@/Components/feedback/Toast';

export default function GeneralTab({ general = {} }) {
    const [maintenance, setMaintenance] = useState(Boolean(general.maintenance));
    const [savingMaintenance, setSavingMaintenance] = useState(false);

    const [bannerEnabled, setBannerEnabled] = useState(Boolean(general.banner_enabled));
    const [bannerText, setBannerText] = useState(general.banner_text || '');
    const [bannerStyle, setBannerStyle] = useState(general.banner_style || 'warning');
    const [savingBanner, setSavingBanner] = useState(false);

    function toggleMaintenance(enabled) {
        setMaintenance(enabled);
        setSavingMaintenance(true);

        router.put('/settings/maintenance', { enabled }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(enabled ? 'Mode pemeliharaan sistem diaktifkan.' : 'Mode pemeliharaan dinonaktifkan.');
            },
            onError: () => {
                setMaintenance(!enabled);
                toast.error('Gagal mengubah status pemeliharaan.');
            },
            onFinish: () => setSavingMaintenance(false),
        });
    }

    function saveBanner(e) {
        e.preventDefault();
        setSavingBanner(true);

        router.put('/settings/banner', {
            text: bannerText,
            style: bannerStyle,
            enabled: bannerEnabled,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Pengaturan banner berhasil disimpan.'),
            onError: () => toast.error('Gagal menyimpan banner.'),
            onFinish: () => setSavingBanner(false),
        });
    }

    return (
        <div className="space-y-6">
            {/* Mode Pemeliharaan (Maintenance Mode) */}
            <section className="card-shell p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="type-h2 font-bold text-[#1E1B4B]">Mode Pemeliharaan (Maintenance Mode)</h2>
                            {maintenance ? (
                                <span className="badge border-0 bg-amber-100 text-xs font-semibold text-amber-800">
                                    Aktif
                                </span>
                            ) : (
                                <span className="badge border-0 bg-slate-100 text-xs font-medium text-slate-600">
                                    Nonaktif
                                </span>
                            )}
                        </div>
                        <p className="type-small mt-1 text-[#334155]">
                            Saat aktif, pengguna umum akan melihat layar pemeliharaan (503). SuperAdmin tetap memiliki akses penuh ke sistem.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={maintenance}
                        disabled={savingMaintenance}
                        onChange={(e) => toggleMaintenance(e.target.checked)}
                        className="toggle border-slate-300 bg-slate-200 checked:border-[#6D28D9] checked:bg-[#6D28D9]"
                        aria-label="Toggle mode pemeliharaan"
                    />
                </div>

                <p className="mt-3 text-xs text-slate-500">
                    {savingMaintenance ? 'Menyimpan perubahan...' : maintenance ? 'Sistem sedang dibatasi untuk perbaikan server.' : 'Sistem beroperasi normal untuk semua pengunjung.'}
                </p>
            </section>

            {/* Banner Pengumuman Global */}
            <section className="card-shell p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="type-h2 font-bold text-[#1E1B4B]">Banner Pengumuman Siaran</h2>
                        <p className="type-small mt-1 text-[#334155]">
                            Tampilkan pesan pengumuman penting di bagian paling atas seluruh halaman aplikasi.
                        </p>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2">
                        <span className="text-xs font-medium text-slate-700">Tampilkan Banner</span>
                        <input
                            type="checkbox"
                            checked={bannerEnabled}
                            onChange={(e) => setBannerEnabled(e.target.checked)}
                            className="toggle toggle-sm border-slate-300 bg-slate-200 checked:border-[#6D28D9] checked:bg-[#6D28D9]"
                        />
                    </label>
                </div>

                <form onSubmit={saveBanner} className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <label className="type-caption block font-semibold text-[#1E1B4B]">
                                Pesan Pengumuman
                            </label>
                            <input
                                type="text"
                                maxLength={200}
                                value={bannerText}
                                onChange={(e) => setBannerText(e.target.value)}
                                placeholder="Contoh: Pemeliharaan database dijadwalkan malam ini pukul 23:00 WIB."
                                className="input input-sm border-slate-300 bg-white mt-1 w-full text-sm text-[#1E1B4B] focus:border-[#6D28D9] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="type-caption block font-semibold text-[#1E1B4B]">
                                Gaya Urgensi
                            </label>
                            <select
                                value={bannerStyle}
                                onChange={(e) => setBannerStyle(e.target.value)}
                                className="select select-sm border-slate-300 bg-white mt-1 w-full text-sm text-[#1E1B4B] focus:border-[#6D28D9] focus:outline-none"
                            >
                                <option value="info">Info (Biru Solid)</option>
                                <option value="warning">Peringatan (Amber Solid)</option>
                                <option value="critical">Kritis / Bahaya (Merah Solid)</option>
                            </select>
                        </div>
                    </div>

                    {/* Live Preview */}
                    {bannerText && (
                        <div className="rounded-xl border border-dashed border-slate-300 p-3 bg-slate-50">
                            <span className="text-xs font-semibold text-slate-500">Pratinjau Banner:</span>
                            <div
                                className={`mt-2 flex items-center justify-between rounded-lg px-4 py-2 text-xs font-semibold ${
                                    bannerStyle === 'critical'
                                        ? 'bg-red-600 text-white'
                                        : bannerStyle === 'info'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-[#F59E0B] text-[#1E1B4B]'
                                }`}
                            >
                                <span>{bannerText}</span>
                                <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                    {bannerStyle}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={savingBanner}
                            className="btn btn-sm border-0 bg-[#6D28D9] font-semibold text-white hover:bg-[#5b21b6] disabled:opacity-60"
                        >
                            {savingBanner ? 'Menyimpan...' : 'Simpan Pengaturan Banner'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

