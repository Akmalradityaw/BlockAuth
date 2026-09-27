import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/data/DataTable';
import { StatCard } from '@/Components/data/Ui';
import { initials } from '@/lib/ui';

function ActionBadge({ action }) {
    let color = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

    if (action.startsWith('auth:login')) {
        color = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    } else if (action.startsWith('auth:failed') || action.startsWith('auth:2fa_failed')) {
        color = 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    } else if (action.startsWith('auth:logout')) {
        color = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    } else if (action.startsWith('settings:')) {
        color = 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    } else if (action.startsWith('roles:')) {
        color = 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
    } else if (action.startsWith('profile:')) {
        color = 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
    } else if (action.startsWith('session:')) {
        color = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    } else if (action.startsWith('impersonate:')) {
        color = 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800';
    } else if (action.startsWith('users:delete')) {
        color = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800';
    }

    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold ${color}`}>
            {action}
        </span>
    );
}

export default function AuditLogIndex({ logs, filters = {}, stats, actionOptions = [] }) {
    const [activeMetadata, setActiveMetadata] = useState(null);

    function applyFilter(newParams) {
        router.get(
            '/audit-logs',
            { ...filters, ...newParams },
            { preserveState: true, replace: true }
        );
    }

    function handleResetFilters() {
        router.get('/audit-logs', {}, { preserveState: true, replace: true });
    }

    const columns = [
        { key: 'created_at', label: 'Waktu', sortable: true },
        { key: 'user', label: 'Pengguna', sortable: false },
        { key: 'action', label: 'Aksi', sortable: true },
        { key: 'description', label: 'Deskripsi Aktivitas', sortable: false },
        { key: 'device', label: 'Perangkat & IP', sortable: false },
        { key: 'detail', label: 'Detail', sortable: false, headerClassName: 'text-right', className: 'text-right' },
    ];

    const hasActiveFilters = Boolean(filters.search || filters.action);

    return (
        <AppLayout
            eyebrow="Audit & Keamanan"
            title="Log Aktivitas Sistem"
            desc="Rekam jejak seluruh aktivitas login, perubahan data profil, dan konfigurasi sistem."
            actions={
                <Link
                    href="/dashboard"
                    className="btn btn-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1B4B] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                    Kembali ke dashboard
                </Link>
            }
        >
            <Head title="Log Aktivitas Sistem" />

            {/* Statistik Ringkasan */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Log Aktivitas" value={stats.total} />
                <StatCard label="Login Berhasil Hari Ini" value={stats.logins_today} />
                <StatCard label="Login Gagal Hari Ini" value={stats.failed_today} />
                <StatCard label="Perubahan Sistem" value={stats.system_changes} />
            </div>

            {/* DataTable Interaktif */}
            <div className="mt-6">
                <DataTable
                    columns={columns}
                    data={logs.data}
                    sort={filters.sort || 'id'}
                    direction={filters.direction || 'desc'}
                    onSort={(column, direction) => applyFilter({ sort: column, direction })}
                    search={filters.search || ''}
                    onSearch={(query) => applyFilter({ search: query || undefined })}
                    searchPlaceholder="Cari nama, email, IP, atau deskripsi..."
                    filterSlot={
                        <>
                            <select
                                value={filters.action || ''}
                                onChange={(e) => applyFilter({ action: e.target.value || undefined })}
                                className="select select-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-[#6D28D9] focus:outline-none"
                            >
                                <option value="">Semua Tipe Aksi</option>
                                {actionOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
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
                    pagination={logs}
                    onPerPageChange={(perPage) => applyFilter({ per_page: perPage })}
                    emptyTitle="Tidak ada log aktivitas"
                    emptyMessage={hasActiveFilters ? 'Tidak ada data log yang cocok dengan kriteria pencarian.' : 'Belum ada catatan aktivitas dalam sistem.'}
                    renderRow={(log) => (
                        <tr key={log.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                            <td className="py-3 pl-4 whitespace-nowrap">
                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{log.created_at}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">{log.created_at_human}</div>
                            </td>
                            <td className="whitespace-nowrap">
                                {log.user ? (
                                    <div className="flex items-center gap-2.5">
                                        {log.user.avatar_url ? (
                                            <img
                                                src={log.user.avatar_url}
                                                alt={log.user.name}
                                                className="h-7 w-7 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E1B4B] dark:bg-violet-900 text-[11px] font-bold text-white">
                                                {initials(log.user.name)}
                                            </span>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.user.name}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{log.user.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Sistem / Tamu
                                    </span>
                                )}
                            </td>
                            <td className="whitespace-nowrap">
                                <ActionBadge action={log.action} />
                            </td>
                            <td className="max-w-sm text-xs text-slate-700 dark:text-slate-300">
                                {log.description}
                            </td>
                            <td className="whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                                <div>{log.browser} • {log.platform}</div>
                                <div className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{log.ip_address}</div>
                            </td>
                            <td className="pr-4 text-right whitespace-nowrap">
                                {log.properties ? (
                                    <button
                                        type="button"
                                        onClick={() => setActiveMetadata(log)}
                                        className="btn btn-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300"
                                    >
                                        Detail
                                    </button>
                                ) : (
                                    <span className="text-xs text-slate-300 dark:text-slate-600">-</span>
                                )}
                            </td>
                        </tr>
                    )}
                    renderMobileCard={(log) => (
                        <div key={log.id} className="card-shell space-y-3 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <ActionBadge action={log.action} />
                                <span className="text-xs text-slate-500 dark:text-slate-400">{log.created_at_human}</span>
                            </div>

                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{log.description}</p>

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {log.user ? log.user.name : 'Sistem / Anonim'}
                                </span>
                                <span className="font-mono">{log.ip_address}</span>
                            </div>

                            {log.properties && (
                                <button
                                    type="button"
                                    onClick={() => setActiveMetadata(log)}
                                    className="btn btn-xs w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                    Lihat Metadata
                                </button>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Modal Detail Metadata */}
            {activeMetadata && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setActiveMetadata(null)}
                    />
                    <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="type-h3 text-[#1E1B4B] dark:text-slate-100">Detail Metadata Log</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{activeMetadata.action}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveMetadata(null)}
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Aktivitas:</p>
                            <p className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">{activeMetadata.description}</p>
                        </div>

                        <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Payload / Nilai Perubahan (JSON):</p>
                            <pre className="mt-1 max-h-60 overflow-auto rounded-xl bg-slate-900 dark:bg-slate-950 border border-transparent dark:border-slate-800 p-3 font-mono text-xs text-emerald-400">
                                {JSON.stringify(activeMetadata.properties, null, 2)}
                            </pre>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveMetadata(null)}
                                className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5b21b6]"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
