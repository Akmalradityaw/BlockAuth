import { Link } from '@inertiajs/react';

export default function AuditFilterBar({
    search,
    setSearch,
    action,
    setAction,
    actionOptions = [],
    onApply,
    onReset,
    hasActiveFilters,
}) {
    const exportParams = new URLSearchParams();
    exportParams.set('entity', 'audit');
    exportParams.set('mode', 'export');
    if (search) exportParams.set('search', search);
    if (action) exportParams.set('action', action);
    const exportUrl = `/export-import?${exportParams.toString()}`;
    return (
        <div className="card-shell mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onApply({ search: e.target.value })}
                    placeholder="Cari deskripsi, IP, nama..."
                    className="input input-sm border-slate-300 bg-white text-sm focus:border-[#6D28D9] focus:outline-none"
                />

                <select
                    value={action}
                    onChange={(e) => {
                        setAction(e.target.value);
                        onApply({ action: e.target.value });
                    }}
                    className="select select-sm border-slate-300 bg-white text-sm focus:border-[#6D28D9] focus:outline-none"
                >
                    <option value="">Semua Tipe Aksi</option>
                    {actionOptions.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={() => onApply()}
                    className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5b21b6]"
                >
                    Cari
                </button>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    href={exportUrl}
                    className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-50 flex items-center gap-1.5 font-medium"
                    title="Buka halaman ekspor log aktivitas"
                >
                    <svg className="h-4 w-4 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Ekspor Log</span>
                </Link>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="btn btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    >
                        Reset Filter
                    </button>
                )}
            </div>
        </div>
    );
}

