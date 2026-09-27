import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';

export default function PrivacyAndDataManagement() {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    function handleDeleteAccount(e) {
        e.preventDefault();
        destroy('/profile/delete-account', {
            preserveScroll: true,
            onSuccess: () => setConfirmingDeletion(false),
            onError: () => {},
        });
    }

    return (
        <section className="card-shell p-4 sm:p-6">
            <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Privasi & Manajemen Data (GDPR)</h2>
            <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                Kelola hak privasi Anda, unduh salinan lengkap data pribadi, atau hapus akun Anda secara mandiri.
            </p>

            <div className="mt-5 space-y-4">
                {/* Bagian Portabilitas Data */}
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Portabilitas Data (Unduh Data JSON)</h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Dapatkan salinan arsip digital berisi data profil, riwayat aktivitas, daftar sesi, dan hak akses Anda.
                        </p>
                    </div>
                    <a
                        href="/profile/export"
                        download
                        className="btn btn-sm shrink-0 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        Unduh Data Akun (JSON)
                    </a>
                </div>

                {/* Bagian Zona Bahaya (Hapus Akun) */}
                <div className="flex flex-col gap-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-red-900 dark:text-red-300">Hapus Akun Secara Permanen</h3>
                        <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">
                            Setelah akun Anda dihapus, semua data dan sesi login akan dicabut secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            clearErrors();
                            reset();
                            setConfirmingDeletion(true);
                        }}
                        className="btn btn-sm shrink-0 border border-red-300 dark:border-red-900/50 bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40"
                    >
                        Hapus Akun Saya
                    </button>
                </div>
            </div>

            {/* Modal Konfirmasi Hapus Akun */}
            {confirmingDeletion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setConfirmingDeletion(false)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 font-bold text-sm">
                                !
                            </span>
                            <h3 className="type-h3 text-red-900 dark:text-red-300">Konfirmasi Penghapusan Akun</h3>
                        </div>

                        <p className="type-small mt-2 text-slate-600 dark:text-slate-400">
                            Apakah Anda benar-benar yakin ingin menghapus akun Anda? Masukkan kata sandi Anda di bawah ini untuk mengonfirmasi penghapusan permanen.
                        </p>

                        <form onSubmit={handleDeleteAccount} className="mt-4 flex flex-col gap-3">
                            <FormInput
                                label="Kata Sandi Anda"
                                type="password"
                                placeholder="Masukkan kata sandi untuk konfirmasi"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                required
                                autoFocus
                            />

                            <div className="mt-3 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmingDeletion(false)}
                                    className="btn btn-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    disabled={processing}
                                >
                                    Batal
                                </button>
                                <SolidButton
                                    processing={processing}
                                    variant="critical"
                                    type="submit"
                                >
                                    Hapus Permanen
                                </SolidButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
