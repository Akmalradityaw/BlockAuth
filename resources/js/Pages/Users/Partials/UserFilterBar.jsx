import { useState } from 'react';
import { Link, router } from '@inertiajs/react';

export default function UserFilterBar({
    filters = {},
    availableRoles = [],
    canCreate = false,
    onOpenCreate = () => {},
    onOpenImport = () => {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [status, setStatus] = useState(filters.status || '');

    function applyFilter(newParams = {}) {
        const query = {
            search,
            role,
            status,
            ...newParams,
        };

        // Bersihkan parameter kosong
        Object.keys(query).forEach((key) => {
            if (!query[key]) delete query[key];
        });

        router.get('/users', query, {
            preserveState: true,
            replace: true,
        });
    }

    function handleSearchSubmit(e) {
        e.preventDefault();
        applyFilter({ search });
    }

    function handleRoleChange(e) {
        const val = e.target.value;
        setRole(val);
        applyFilter({ role: val });
    }

    function handleStatusChange(e) {
        const val = e.target.value;
        setStatus(val);
        applyFilter({ status: val });
    }

    function handleReset() {
        setSearch('');
        setRole('');
        setStatus('');
        router.get('/users', {}, { preserveState: true, replace: true });
    }

    const hasActiveFilters = Boolean(search || role || status);

    // Bangun URL export terpadu sesuai filter yang sedang aktif
    const exportParams = new URLSearchParams();
    exportParams.set('entity', 'users');
    exportParams.set('mode', 'export');
    if (search) exportParams.set('search', search);
    if (role) exportParams.set('role', role);
    if (status) exportParams.set('status', status);
    const exportUrl = `/export-import?${exportParams.toString()}`;

    return (
        <div className="card-shell mt-6 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Form Filter */}
                <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-wrap items-center gap-2">
                    {/* Input Pencarian */}
                    <div className="relative min-w-[200px] flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, email, bio..."
                            className="input input-bordered input-sm input-brand w-full bg-white text-[#1E1B4B]"
                        />
                    </div>

                    {/* Filter Role */}
                    <select
                        value={role}
                        onChange={handleRoleChange}
                        className="select select-bordered select-sm bg-white text-[#1E1B4B]"
                    >
                        <option value="">Semua Role</option>
                        {availableRoles.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>

                    {/* Filter Status */}
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="select select-bordered select-sm bg-white text-[#1E1B4B]"
                    >
                        <option value="">Semua Status</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                    </select>

                    <button type="submit" className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]">
                        Cari
                    </button>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="btn btn-sm border border-slate-300 bg-white text-[#334155] hover:bg-slate-100"
                        >
                            Reset
                        </button>
                    )}
                </form>

                {/* Tombol Aksi Kanan: Impor, Ekspor 9 Format, & Tambah User */}
                <div className="flex items-center gap-2">
                    {canCreate && (
                        <Link
                            href="/export-import?entity=users&mode=import"
                            className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-50 flex items-center gap-1 font-medium"
                            title="Buka pusat impor pengguna"
                        >
                            <svg className="h-4 w-4 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Impor Data</span>
                        </Link>
                    )}

                    <Link
                        href={exportUrl}
                        className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-50 flex items-center gap-1.5 font-medium"
                        title="Buka halaman ekspor data pengguna"
                    >
                        <svg className="h-4 w-4 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Ekspor Data</span>
                    </Link>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={onOpenCreate}
                            className="btn btn-sm border-0 bg-[#F59E0B] text-[#1E1B4B] hover:bg-[#B45309] hover:text-white"
                        >
                            + Tambah Pengguna
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

