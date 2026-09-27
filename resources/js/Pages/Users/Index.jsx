import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/data/DataTable';
import { fire } from '@/Components/feedback/Swal';
import { hideLoading, showLoading } from '@/Components/feedback/LoadingOverlay';
import { RoleBadge, StatCard } from '@/Components/data/Ui';
import { can } from '@/lib/can';
import { initials } from '@/lib/ui';

export default function UserIndex({ users, stats, filters = {}, availableRoles = [] }) {
    const { auth, is_impersonating } = usePage().props;
    const perms = auth?.permissions || [];
    const canDelete = can(perms, 'users:delete');
    const canManage = can(perms, 'roles:manage');
    const canImpersonate = can(perms, 'users:impersonate') && !is_impersonating;

    function applyFilter(key, val) {
        router.get(
            '/users',
            { ...filters, [key]: val || undefined },
            { preserveState: true, replace: true }
        );
    }

    function handleSort(column, direction) {
        router.get(
            '/users',
            { ...filters, sort: column, direction },
            { preserveState: true, replace: true }
        );
    }

    function handleResetFilters() {
        router.get('/users', {}, { preserveState: true, replace: true });
    }

    async function askImpersonate(u) {
        const { isConfirmed } = await fire({
            title: 'Impersonasi Pengguna',
            text: `Masuk ke sistem sebagai ${u.name} (${u.email})? Anda dapat kembali ke akun admin kapan saja melalui banner di atas.`,
            icon: 'question',
            confirmText: 'Ya, Masuk',
            cancelText: 'Batal',
            showCancelButton: true,
        });
        if (isConfirmed) {
            showLoading('Mengalihkan ke akun pengguna...');
            router.post(`/users/${u.id}/impersonate`, {}, {
                onFinish: () => hideLoading(),
            });
        }
    }

    async function askDelete(u) {
        const { isConfirmed } = await fire({
            title: 'Hapus pengguna',
            text: `Hapus ${u.name} (${u.email}) secara permanen?`,
            icon: 'warning',
            confirmText: 'Ya, hapus',
            cancelText: 'Batal',
            showCancelButton: true,
        });
        if (isConfirmed) {
            showLoading('Menghapus pengguna...');
            router.delete(`/users/${u.id}`, {
                preserveScroll: true,
                onFinish: () => hideLoading(),
            });
        }
    }

    function handleRoleChange(user, newRole) {
        if (!newRole) return;
        showLoading(`Mengubah role ${user.name}...`);
        router.patch(`/users/${user.id}/role`, { role: newRole }, {
            preserveScroll: true,
            onFinish: () => hideLoading(),
        });
    }

    const columns = [
        { key: 'name', label: 'Pengguna', sortable: true },
        { key: 'bio', label: 'Bio', sortable: false },
        { key: 'roles', label: 'Role', sortable: false },
        { key: 'verified', label: 'Status', sortable: false },
        { key: 'created_at', label: 'Bergabung', sortable: true },
        ...((canDelete || canImpersonate)
            ? [{ key: 'actions', label: 'Aksi', sortable: false, headerClassName: 'text-right', className: 'text-right' }]
            : []),
    ];

    const hasActiveFilters = Boolean(filters.search || filters.role);

    return (
        <AppLayout
            eyebrow="Direktori"
            title="Data Pengguna"
            desc="Daftar akun terdaftar dengan role, status verifikasi, dan tanggal bergabung."
            actions={
                <>
                    {canManage && (
                        <Link href="/roles/permissions" className="btn btn-sm border-0 bg-[#6D28D9] text-white">
                            Kelola Akses
                        </Link>
                    )}
                    <Link
                        href="/dashboard"
                        className="btn btn-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1B4B] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        Kembali ke dashboard
                    </Link>
                </>
            }
        >
            <Head title="Data Pengguna" />

            {/* Statistik Kartu */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Pengguna" value={stats.total} />
                <StatCard label="Akun Terverifikasi" value={stats.verified} />
                <StatCard label="Akun SuperAdmin" value={stats.admins} />
            </div>

            {/* DataTable Interaktif */}
            <div className="mt-6">
                <DataTable
                    columns={columns}
                    data={users.data}
                    sort={filters.sort || 'id'}
                    direction={filters.direction || 'desc'}
                    onSort={handleSort}
                    search={filters.search || ''}
                    onSearch={(query) => applyFilter('search', query)}
                    searchPlaceholder="Cari nama, email, atau bio..."
                    filterSlot={
                        <>
                            <select
                                value={filters.role || ''}
                                onChange={(e) => applyFilter('role', e.target.value)}
                                className="select select-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-[#6D28D9] focus:outline-none"
                            >
                                <option value="">Semua Peran (Role)</option>
                                {availableRoles.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="btn btn-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Reset
                                </button>
                            )}
                        </>
                    }
                    pagination={users}
                    onPerPageChange={(perPage) => applyFilter('per_page', perPage)}
                    emptyTitle="Tidak ada pengguna"
                    emptyMessage={hasActiveFilters ? 'Tidak ada pengguna yang cocok dengan filter pencarian.' : 'Belum ada pengguna terdaftar.'}
                    renderRow={(u) => (
                        <tr key={u.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                            <td className="py-3 pl-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    {u.avatar_url ? (
                                        <img src={u.avatar_url} alt={u.name} className="h-9 w-9 rounded-xl object-cover" />
                                    ) : (
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E1B4B] dark:bg-slate-800 text-xs font-bold text-white">
                                            {initials(u.name)}
                                        </span>
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-[#1E1B4B] dark:text-slate-100">
                                            {u.name} {u.username && <span className="font-normal text-slate-500">(@{u.username})</span>}
                                        </p>
                                        <p className="text-[11px] text-[#334155] dark:text-slate-400">{u.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="max-w-xs truncate text-xs text-[#334155] dark:text-slate-400">{u.bio || '-'}</td>
                            <td className="whitespace-nowrap">
                                {canManage && u.id !== auth.user.id ? (
                                    <select
                                        value={u.roles[0] || ''}
                                        onChange={(e) => handleRoleChange(u, e.target.value)}
                                        className="select select-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 focus:border-[#6D28D9] focus:outline-none"
                                    >
                                        <option value="" disabled>Pilih Role</option>
                                        {availableRoles.map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <RoleBadge roles={u.roles} />
                                )}
                            </td>
                            <td className="whitespace-nowrap">
                                <span className={`badge border-0 text-xs font-medium ${u.verified ? 'bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                    {u.verified ? 'Verified' : 'Unverified'}
                                </span>
                            </td>
                            <td className="whitespace-nowrap text-xs text-[#334155] dark:text-slate-400">{u.joined}</td>
                            {(canDelete || canImpersonate) && (
                                <td className="pr-4 text-right whitespace-nowrap">
                                    {u.id !== auth.user.id ? (
                                        <div className="flex items-center justify-end gap-1.5">
                                            {canImpersonate && (
                                                <button
                                                    type="button"
                                                    onClick={() => askImpersonate(u)}
                                                    className="btn btn-xs border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60"
                                                >
                                                    Impersonasi
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => askDelete(u)}
                                                    className="btn btn-xs border-0 bg-red-800 text-white hover:bg-red-900"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 font-medium">Anda</span>
                                    )}
                                </td>
                            )}
                        </tr>
                    )}
                    renderMobileCard={(u) => (
                        <article key={u.id} className="card-shell flex flex-col gap-3 p-4">
                            <div className="flex items-center gap-3">
                                {u.avatar_url ? (
                                    <img src={u.avatar_url} alt={u.name} className="h-10 w-10 rounded-xl object-cover" />
                                ) : (
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6D28D9] text-sm font-bold text-white">
                                        {initials(u.name)}
                                    </span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-[#1E1B4B] dark:text-slate-100">{u.name}</p>
                                    <p className="text-xs truncate text-[#334155] dark:text-slate-400">{u.email}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
                                <RoleBadge roles={u.roles} />
                                <span className={`badge border-0 text-xs ${u.verified ? 'bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                    {u.verified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>

                            {u.bio && <p className="text-xs text-[#334155] dark:text-slate-400 line-clamp-2">{u.bio}</p>}

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>Bergabung: {u.joined}</span>

                                {u.id !== auth.user.id && (
                                    <div className="flex items-center gap-1.5">
                                        {canImpersonate && (
                                            <button
                                                type="button"
                                                onClick={() => askImpersonate(u)}
                                                className="btn btn-xs border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300"
                                            >
                                                Impersonasi
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                onClick={() => askDelete(u)}
                                                className="btn btn-xs border-0 bg-red-800 text-white"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </article>
                    )}
                />
            </div>
        </AppLayout>
    );
}
