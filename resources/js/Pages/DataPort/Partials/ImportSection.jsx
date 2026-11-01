import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { fire } from '@/Components/feedback/Swal';
import { showLoading, hideLoading } from '@/Components/feedback/LoadingOverlay';
import SolidButton from '@/Components/ui/SolidButton';

export default function ImportSection({
    stats = {},
    initialEntity = 'users',
}) {
    const [entity, setEntity] = useState(initialEntity); // 'users' | 'settings'
    const [templateFormat, setTemplateFormat] = useState('csv');

    // Form Impor Pengguna
    const userForm = useForm({ file: null });

    // Form Restore Pengaturan
    const settingsForm = useForm({ file: null });

    function handleDownloadTemplate() {
        window.location.href = `/users/import/template?format=${templateFormat}`;
    }

    function handleUserSubmit(e) {
        e.preventDefault();
        if (!userForm.data.file) return;

        showLoading('Mengunggah dan memproses data pengguna...');
        userForm.post('/users/import', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                hideLoading();
                userForm.reset();
            },
            onError: () => {
                hideLoading();
            },
        });
    }

    async function handleSettingsSubmit(e) {
        e.preventDefault();
        if (!settingsForm.data.file) return;

        const { isConfirmed } = await fire({
            title: 'Pulihkan Konfigurasi Sistem?',
            text: 'Seluruh pengaturan aplikasi saat ini akan ditimpa dengan berkas cadangan. Kredensial rahasia yang tersimpan di server akan tetap dipertahankan.',
            icon: 'warning',
            confirmText: 'Ya, Pulihkan Sekarang',
            showCancelButton: true,
        });

        if (isConfirmed) {
            showLoading('Memulihkan konfigurasi sistem...');
            settingsForm.post('/settings/restore', {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    hideLoading();
                    settingsForm.reset();
                },
                onError: () => {
                    hideLoading();
                },
            });
        }
    }

    return (
        <div className="space-y-6">
            {/* Pilihan Entitas yang Ingin Diimpor */}
            <div className="card-shell p-6">
                <h3 className="text-base font-bold text-[#1E1B4B]">Pilih Data yang Ingin Diimpor</h3>
                <p className="mt-1 text-xs text-slate-500">
                    Pilih target data yang ingin Anda tambahkan atau pulihkan ke dalam sistem.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => setEntity('users')}
                        className={`flex flex-col text-left rounded-xl border p-4 transition-all ${
                            entity === 'users'
                                ? 'border-[#6D28D9] bg-indigo-50/40 ring-1 ring-[#6D28D9]'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                    >
                        <span className="font-bold text-sm text-[#1E1B4B]">Impor Pengguna Baru</span>
                        <span className="mt-1 text-xs text-slate-500">
                            Tambah banyak pengguna sekaligus via CSV, Excel, Word, JSON, SQL, dll.
                        </span>
                        <span className="mt-3 inline-block rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-[#6D28D9] w-fit">
                            Maks. 500 Baris / Berkas
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setEntity('settings')}
                        className={`flex flex-col text-left rounded-xl border p-4 transition-all ${
                            entity === 'settings'
                                ? 'border-[#6D28D9] bg-indigo-50/40 ring-1 ring-[#6D28D9]'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                    >
                        <span className="font-bold text-sm text-[#1E1B4B]">Pemulihan Konfigurasi (Restore JSON)</span>
                        <span className="mt-1 text-xs text-slate-500">
                            Pulihkan pengaturan sistem dari berkas cadangan resmi BlockAuth.
                        </span>
                        <span className="mt-3 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 w-fit">
                            Perlindungan Kredensial Rahasia
                        </span>
                    </button>
                </div>
            </div>

            {/* Bagian Impor Pengguna */}
            {entity === 'users' ? (
                <div className="space-y-6">
                    {/* Unduh Template */}
                    <div className="card-shell p-6">
                        <h3 className="text-base font-bold text-[#1E1B4B]">1. Unduh Template Impor Siap Pakai</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Gunakan berkas template dengan susunan kolom standar: <code className="text-[#6D28D9]">name, email, role, password</code>.
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                            <select
                                value={templateFormat}
                                onChange={(e) => setTemplateFormat(e.target.value)}
                                className="select select-bordered select-sm bg-white text-[#1E1B4B]"
                            >
                                <option value="csv">Format CSV (.csv)</option>
                                <option value="xlsx">Format Excel (.xlsx)</option>
                                <option value="docx">Format Word (.docx)</option>
                                <option value="json">Format JSON (.json)</option>
                                <option value="sql">Format SQL (.sql)</option>
                                <option value="md">Format Markdown (.md)</option>
                                <option value="txt">Format Plain Text (.txt)</option>
                            </select>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-100"
                            >
                                Unduh Template
                            </button>
                        </div>
                    </div>

                    {/* Unggah Berkas Impor Pengguna */}
                    <div className="card-shell p-6">
                        <h3 className="text-base font-bold text-[#1E1B4B]">2. Unggah Berkas Data Pengguna</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Pilih berkas yang telah Anda isi data pengguna (maks. 5MB).
                        </p>

                        <form onSubmit={handleUserSubmit} className="mt-4 max-w-xl space-y-4">
                            <div>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.docx,.html,.htm,.json,.sql,.md,.txt"
                                    onChange={(e) => userForm.setData('file', e.target.files[0])}
                                    className="file-input file-input-bordered file-input-sm w-full bg-white text-[#1E1B4B]"
                                    required
                                />
                                {userForm.errors.file && (
                                    <p className="mt-1 text-xs text-rose-600">{userForm.errors.file}</p>
                                )}
                            </div>

                            <SolidButton
                                type="submit"
                                variant="primary"
                                size="sm"
                                loading={userForm.processing}
                                disabled={!userForm.data.file || userForm.processing}
                            >
                                Mulai Impor Data Pengguna
                            </SolidButton>
                        </form>
                    </div>
                </div>
            ) : (
                /* Bagian Restore Pengaturan */
                <div className="card-shell p-6">
                    <h3 className="text-base font-bold text-[#1E1B4B]">Pemulihan Konfigurasi Sistem (Restore JSON)</h3>
                    <p className="mt-1 text-sm text-[#334155]">
                        Unggah berkas cadangan JSON resmi untuk memulihkan seluruh pengaturan aplikasi.
                    </p>

                    <form onSubmit={handleSettingsSubmit} className="mt-5 max-w-xl space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Pilih Berkas Cadangan (.json)
                            </label>
                            <input
                                type="file"
                                accept=".json,application/json"
                                onChange={(e) => settingsForm.setData('file', e.target.files[0])}
                                className="file-input file-input-bordered file-input-sm w-full bg-white text-[#1E1B4B]"
                                required
                            />
                            {settingsForm.errors.file && (
                                <p className="mt-1 text-xs text-rose-600">{settingsForm.errors.file}</p>
                            )}
                        </div>

                        <SolidButton
                            type="submit"
                            variant="warning"
                            size="sm"
                            loading={settingsForm.processing}
                            disabled={!settingsForm.data.file || settingsForm.processing}
                        >
                            Pulihkan Pengaturan
                        </SolidButton>
                    </form>
                </div>
            )}
        </div>
    );
}

