import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/data/DataTable';
import { StatCard, RoleBadge } from '@/Components/data/Ui';
import { initials } from '@/lib/ui';
import { showToast } from '@/Components/feedback/Toast';

function DeviceIcon({ isMobile, className = 'h-5 w-5' }) {
    if (isMobile) {
        return (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        );
    }
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

export default function GlobalSessionsIndex({ sessions, filters = {}, stats }) {
    function applyFilter(newParams) {
        router.get(
            '/security/sessions',
            { ...filters, ...newParams },
            { preserveState: true, replace: true }
        );
    }

    function handleTerminate(sess) {
        if (!confirm(`Putuskan sesi login milik ${sess.user_name} (${sess.platform} • ${sess.browser})? Pengguna akan langsung dikeluarkan dari sistem.`)) return;

        router.delete(`/security/sessions/${sess.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Sesi login untuk ${sess.user_name} berhasil diputuskan.`, 'info', 'Sesi Diputus');
            },
        });
    }

    const columns = [
        { key: 'user_name', label: 'Pengguna', sortable: false },
        { key: 'device', label: 'Perangkat & Browser', sortable: false },
        { key: 'ip_address', label: 'Alamat IP', sortable: false },
        { key: 'last_active', label: 'Aktivitas Terakhir', sortable: false },
        { key: 'status', label: 'Status Sesi', sortable: false },
        { key: 'action', label: 'Aksi', sortable: false, headerClassName: 'text-right', className: 'text-right' },
    ];

    const hasActiveFilters = Boolean(filters.search);

    return (
        <AppLayout
            eyebrow="Pengawasan Akses"
            title="Sesi & Perangkat Global"
            desc="Pantau seluruh sesi aktif pengguna di seluruh sistem, telusuri anomali perangkat, dan putuskan sesi mencurigakan secara terpusat."
        >
            <Head title="Sesi & Perangkat Global" />

            {/* Statistik Ringkasan */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Sesi Aktif" value={stats.total} note="Sesi valid yang tersimpan di sistem" />
                <StatCard label="Pengguna Unik Online" value={stats.unique_users} note="Akun berbeda dengan sesi aktif" />
                <StatCard label="Sesi Komputer (Desktop)" value={stats.desktop} note="Browser desktop & workstation" />
                <StatCard label="Sesi Ponsel & Tablet" value={stats.mobile} note="Akses dari perangkat mobile" />
            </div>

            {/* Tabel Data Sesi */}
            <div className="mt-6">
                <DataTable
                    columns={columns}
                    data={sessions.data}
                    search={filters.search || ''}
                    onSearch={(val) => applyFilter({ search: val || undefined })}
                    searchPlaceholder="Cari nama pengguna, email, atau alamat IP..."
                    pagination={sessions}
                    onPerPageChange={(perPage) => applyFilter({ per_page: perPage })}
                    emptyTitle="Tidak ada sesi aktif"
                    emptyMessage={hasActiveFilters ? 'Tidak ada sesi yang cocok dengan kriteria pencarian.' : 'Tidak ada sesi login pengguna yang terdeteksi.'}
                    renderRow={(sess) => (
                        <tr key={sess.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                            <td className="py-3 pl-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    {sess.avatar_url ? (
                                        <img
                                            src={sess.avatar_url}
                                            alt={sess.user_name}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1B4B] dark:bg-violet-900 text-xs font-bold text-white">
                                            {initials(sess.user_name)}
                                        </span>
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{sess.user_name}</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{sess.user_email}</p>
                                    </div>
                                    {sess.user_roles && (
                                        <div className="hidden sm:block">
                                            <RoleBadge roles={sess.user_roles} />
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        <DeviceIcon isMobile={sess.is_mobile} className="h-4 w-4" />
                                    </div>
                                    <div className="text-xs">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{sess.platform}</span>
                                        <span className="text-slate-500 dark:text-slate-400"> • {sess.browser}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="whitespace-nowrap font-mono text-xs text-slate-700 dark:text-slate-300">
                                {sess.ip_address}
                            </td>
                            <td className="whitespace-nowrap text-xs">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{sess.last_activity_human}</div>
                                <div className="text-[11px] text-slate-400 dark:text-slate-500">{sess.last_active_at}</div>
                            </td>
                            <td className="whitespace-nowrap">
                                {sess.is_current ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Sesi Anda Saat Ini
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                        Aktif
                                    </span>
                                )}
                            </td>
                            <td className="pr-4 text-right whitespace-nowrap">
                                {!sess.is_current ? (
                                    <button
                                        type="button"
                                        onClick={() => handleTerminate(sess)}
                                        className="btn btn-xs border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                                    >
                                        Putuskan
                                    </button>
                                ) : (
                                    <span className="text-xs text-slate-400 dark:text-slate-600 italic">Sesi Anda</span>
                                )}
                            </td>
                        </tr>
                    )}
                    renderMobileCard={(sess) => (
                        <div key={sess.id} className="card-shell space-y-3 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        <DeviceIcon isMobile={sess.is_mobile} className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{sess.user_name}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{sess.platform} • {sess.browser}</p>
                                    </div>
                                </div>

                                {sess.is_current ? (
                                    <span className="badge badge-sm badge-success text-[10px] font-bold">
                                        Sesi Anda
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleTerminate(sess)}
                                        className="btn btn-xs border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                                    >
                                        Putuskan
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="font-mono">{sess.ip_address}</span>
                                <span>{sess.last_activity_human}</span>
                            </div>
                        </div>
                    )}
                />
            </div>
        </AppLayout>
    );
}
