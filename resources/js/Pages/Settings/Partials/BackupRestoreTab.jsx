import { useForm } from '@inertiajs/react';
import { fire } from '@/Components/feedback/Swal';
import { showLoading, hideLoading } from '@/Components/feedback/LoadingOverlay';
import SolidButton from '@/Components/ui/SolidButton';

export default function BackupRestoreTab() {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
    });

    function handleDownloadBackup() {
        window.location.href = '/settings/backup?format=json';
    }

    async function handleRestoreSubmit(e) {
        e.preventDefault();
        if (!data.file) return;

        const { isConfirmed } = await fire({
            title: 'Pulihkan Konfigurasi Sistem?',
            text: 'Perhatian: Seluruh pengaturan sistem saat ini akan ditimpa dengan data dari berkas cadangan. Kredensial rahasia yang sudah tersimpan akan tetap dipertahankan.',
            icon: 'warning',
            confirmText: 'Ya, Pulihkan Sekarang',
            showCancelButton: true,
        });

        if (isConfirmed) {
            showLoading('Memulihkan konfigurasi sistem...');
            post('/settings/restore', {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    hideLoading();
                    reset();
                },
                onError: () => {
                    hideLoading();
                },
            });
        }
    }

    return (
        <div className="space-y-6">
            {/* Seksi Ekspor / Backup */}
            <div className="card-shell p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-base font-bold text-[#1E1B4B]">Cadangan Konfigurasi Sistem (Backup)</h3>
                        <p className="mt-1 text-sm text-[#334155]">
                            Unduh seluruh konfigurasi aplikasi, toggle fitur modul, standar keamanan kata sandi, dan metadata penyedia OAuth ke dalam berkas JSON.
                        </p>
                        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
                            <svg className="h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>
                                <strong>Perlindungan Rahasia:</strong> Kata sandi SMTP dan Client Secret OAuth otomatis disensor menjadi <code>__REDACTED__</code> agar aman disimpan atau dipindahkan antar-lingkungan.
                            </span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDownloadBackup}
                        className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6] shrink-0 font-medium"
                    >
                        Unduh Berkas Cadangan (.json)
                    </button>
                </div>
            </div>

            {/* Seksi Impor / Restore */}
            <div className="card-shell p-6">
                <h3 className="text-base font-bold text-[#1E1B4B]">Pemulihan Konfigurasi Sistem (Restore)</h3>
                <p className="mt-1 text-sm text-[#334155]">
                    Unggah berkas cadangan JSON resmi BlockAuth untuk memulihkan konfigurasi sistem atau menyinkronkan pengaturan dari lingkungan staging.
                </p>

                <form onSubmit={handleRestoreSubmit} className="mt-5 max-w-xl space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Pilih Berkas Cadangan (.json)
                        </label>
                        <input
                            type="file"
                            accept=".json,application/json"
                            onChange={(e) => setData('file', e.target.files[0])}
                            className="file-input file-input-bordered file-input-sm w-full bg-white text-[#1E1B4B]"
                            required
                        />
                        {errors.file && <p className="mt-1 text-xs text-rose-600">{errors.file}</p>}
                    </div>

                    <SolidButton
                        type="submit"
                        variant="warning"
                        size="sm"
                        loading={processing}
                        disabled={!data.file || processing}
                    >
                        Pulihkan Pengaturan
                    </SolidButton>
                </form>
            </div>
        </div>
    );
}

