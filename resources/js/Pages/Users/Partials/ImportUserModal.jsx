import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import BaseModal from '@/Components/ui/BaseModal';
import SolidButton from '@/Components/ui/SolidButton';
import { showLoading, hideLoading } from '@/Components/feedback/LoadingOverlay';

export default function ImportUserModal({ isOpen, onClose }) {
    const [templateFormat, setTemplateFormat] = useState('csv');
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
    });

    function handleDownloadTemplate() {
        window.location.href = `/users/import/template?format=${templateFormat}`;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!data.file) return;

        showLoading('Mengunggah dan memproses data pengguna...');
        post('/users/import', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                hideLoading();
                reset();
                onClose();
            },
            onError: () => {
                hideLoading();
            },
        });
    }

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={() => {
                reset();
                onClose();
            }}
            title="Impor Data Pengguna"
            subtitle="Unggah berkas data untuk menambahkan banyak pengguna secara instan."
        >
            <div className="space-y-5">
                {/* Bagian Unduh Template */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                    <p className="text-xs font-semibold text-[#1E1B4B]">Unduh Contoh Template Siap Pakai</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Gunakan berkas template dengan format kolom yang sesuai: <code className="text-[#6D28D9]">name, email, role, password</code>.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                        <select
                            value={templateFormat}
                            onChange={(e) => setTemplateFormat(e.target.value)}
                            className="select select-bordered select-xs bg-white text-[#1E1B4B]"
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
                            className="btn btn-xs border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-100"
                        >
                            Unduh Template
                        </button>
                    </div>
                </div>

                {/* Form Upload */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Pilih Berkas Impor (Maks. 500 baris / 5MB)
                        </label>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.docx,.html,.htm,.json,.sql,.md,.txt"
                            onChange={(e) => setData('file', e.target.files[0])}
                            className="file-input file-input-bordered file-input-sm w-full bg-white text-[#1E1B4B]"
                            required
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                            Didukung: .csv, .xlsx, .docx, .json, .sql, .md, .txt.
                        </p>
                        {errors.file && <p className="mt-1 text-xs text-rose-600">{errors.file}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-sm border border-slate-300 bg-white text-[#334155] hover:bg-slate-100"
                        >
                            Batal
                        </button>
                        <SolidButton
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={processing}
                            disabled={!data.file || processing}
                        >
                            Mulai Impor
                        </SolidButton>
                    </div>
                </form>
            </div>
        </BaseModal>
    );
}

