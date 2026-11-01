import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ExportSection from './Partials/ExportSection';
import ImportSection from './Partials/ImportSection';

export default function DataPortIndex({
    availableRoles = [],
    actionOptions = [],
    stats = {},
    initialMode = 'export',
    initialEntity = 'users',
    selectedIds = [],
}) {
    const [mode, setMode] = useState(initialMode); // 'export' | 'import'

    return (
        <AppLayout
            eyebrow="Pusat Data"
            title="Ekspor & Impor Terpadu"
            desc="Kelola seluruh kebutuhan unduh laporan dan unggah data sistem dalam satu pusat kendali."
            actions={
                <Link
                    href="/dashboard"
                    className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-50"
                >
                    Kembali ke Dashboard
                </Link>
            }
        >
            <Head title="Ekspor & Impor Data" />

            {/* Navigasi Mode Utama (Ekspor vs Impor) */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        type="button"
                        onClick={() => setMode('export')}
                        className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-bold transition-colors flex items-center gap-2 ${
                            mode === 'export'
                                ? 'border-[#6D28D9] text-[#6D28D9]'
                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Ekspor Data</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('import')}
                        className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-bold transition-colors flex items-center gap-2 ${
                            mode === 'import'
                                ? 'border-[#6D28D9] text-[#6D28D9]'
                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Impor Data</span>
                    </button>
                </nav>
            </div>

            {/* Konten Bagian Mode Aktif */}
            <div className="mt-6">
                {mode === 'export' ? (
                    <ExportSection
                        availableRoles={availableRoles}
                        actionOptions={actionOptions}
                        stats={stats}
                        initialEntity={initialEntity}
                        selectedIds={selectedIds}
                    />
                ) : (
                    <ImportSection
                        stats={stats}
                        initialEntity={initialEntity === 'settings' ? 'settings' : 'users'}
                    />
                )}
            </div>
        </AppLayout>
    );
}

