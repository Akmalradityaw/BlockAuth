import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/data/DataTable';
import { StatCard } from '@/Components/data/Ui';
import SolidButton from '@/Components/forms/SolidButton';
import { showToast } from '@/Components/feedback/Toast';

export default function IpRulesIndex({ rules, filters = {}, stats }) {
    const [creatingRule, setCreatingRule] = useState(false);
    const [ruleForm, setRuleForm] = useState({
        ip_address: '',
        type: 'blacklist',
        reason: '',
    });
    const [submitting, setSubmitting] = useState(false);

    function applyFilter(newParams) {
        router.get(
            '/security/ip-rules',
            { ...filters, ...newParams },
            { preserveState: true, replace: true }
        );
    }

    function handleResetFilters() {
        router.get('/security/ip-rules', {}, { preserveState: true, replace: true });
    }

    function handleToggle(rule) {
        router.post(`/settings/ip-rules/${rule.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(
                    `Aturan IP ${rule.ip_address} berhasil diubah statusnya.`,
                    'success',
                    'Status Diperbarui'
                );
            },
        });
    }

    function handleDelete(rule) {
        if (!confirm(`Hapus aturan untuk alamat IP ${rule.ip_address}?`)) return;

        router.delete(`/settings/ip-rules/${rule.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(
                    `Aturan IP ${rule.ip_address} telah dihapus dari sistem.`,
                    'info',
                    'Aturan Dihapus'
                );
            },
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        router.post('/settings/ip-rules', ruleForm, {
            preserveScroll: true,
            onSuccess: () => {
                setCreatingRule(false);
                setRuleForm({ ip_address: '', type: 'blacklist', reason: '' });
                showToast('Aturan IP baru berhasil ditambahkan.', 'success', 'Aturan Disimpan');
            },
            onFinish: () => setSubmitting(false),
        });
    }

    const columns = [
        { key: 'ip_address', label: 'Alamat IP', sortable: true },
        { key: 'type', label: 'Tipe Akses', sortable: true },
        { key: 'reason', label: 'Alasan / Catatan', sortable: false },
        { key: 'is_active', label: 'Status', sortable: true },
        { key: 'created_at', label: 'Didaftarkan', sortable: true },
        { key: 'action', label: 'Aksi', sortable: false, headerClassName: 'text-right', className: 'text-right' },
    ];

    const hasActiveFilters = Boolean(filters.search || filters.type || filters.is_active !== undefined);

    return (
        <AppLayout
            eyebrow="Keamanan Jaringan"
            title="Aturan IP & Firewall"
            desc="Kelola daftar alamat IP yang diblokir (Blacklist) atau diberikan akses prioritas (Whitelist) untuk memproteksi aplikasi."
            actions={
                <button
                    type="button"
                    onClick={() => setCreatingRule(true)}
                    className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
                >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Aturan IP
                </button>
            }
        >
            <Head title="Aturan IP & Firewall" />

            {/* Statistik Ringkasan */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Aturan Terdaftar" value={stats.total} />
                <StatCard label="Blacklist Aktif" value={stats.blacklist} note="Akses diblokir dengan HTTP 403" />
                <StatCard label="Whitelist Aktif" value={stats.whitelist} note="Alamat terpercaya tanpa batasan" />
                <StatCard label="IP Anda Saat Ini" value={stats.my_ip} note="Alamat koneksi Anda sekarang" />
            </div>

            {/* Tabel Data Interaktif */}
            <div className="mt-6">
                <DataTable
                    columns={columns}
                    data={rules.data}
                    sort={filters.sort || 'id'}
                    direction={filters.direction || 'desc'}
                    onSort={(col, dir) => applyFilter({ sort: col, direction: dir })}
                    search={filters.search || ''}
                    onSearch={(val) => applyFilter({ search: val || undefined })}
                    searchPlaceholder="Cari alamat IP atau alasan pemblokiran..."
                    filterSlot={
                        <>
                            <select
                                value={filters.type || ''}
                                onChange={(e) => applyFilter({ type: e.target.value || undefined })}
                                className="select select-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-[#6D28D9] focus:outline-none"
                            >
                                <option value="">Semua Tipe</option>
                                <option value="blacklist">Blacklist</option>
                                <option value="whitelist">Whitelist</option>
                            </select>

                            <select
                                value={filters.is_active === undefined ? '' : String(filters.is_active)}
                                onChange={(e) => applyFilter({ is_active: e.target.value === '' ? undefined : e.target.value })}
                                className="select select-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-[#6D28D9] focus:outline-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="true">Aktif</option>
                                <option value="false">Nonaktif</option>
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
                    pagination={rules}
                    onPerPageChange={(perPage) => applyFilter({ per_page: perPage })}
                    emptyTitle="Tidak ada aturan IP"
                    emptyMessage={hasActiveFilters ? 'Tidak ada aturan IP yang cocok dengan kriteria pencarian.' : 'Belum ada alamat IP yang didaftarkan dalam aturan.'}
                    renderRow={(rule) => (
                        <tr key={rule.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                            <td className="py-3 pl-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {rule.ip_address}
                                    </span>
                                    {rule.ip_address === stats.my_ip && (
                                        <span className="rounded bg-indigo-100 dark:bg-indigo-950/60 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                            IP Anda
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap">
                                <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                        rule.type === 'blacklist'
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    }`}
                                >
                                    {rule.type}
                                </span>
                            </td>
                            <td className="max-w-xs text-xs text-slate-600 dark:text-slate-300 truncate">
                                {rule.reason || '-'}
                            </td>
                            <td className="whitespace-nowrap">
                                <button
                                    type="button"
                                    onClick={() => handleToggle(rule)}
                                    className={`badge badge-sm border-0 font-medium cursor-pointer transition-colors ${
                                        rule.is_active
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    {rule.is_active ? 'Aktif' : 'Nonaktif'}
                                </button>
                            </td>
                            <td className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                {new Date(rule.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </td>
                            <td className="pr-4 text-right whitespace-nowrap">
                                <button
                                    type="button"
                                    onClick={() => handleDelete(rule)}
                                    className="btn btn-xs border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    )}
                    renderMobileCard={(rule) => (
                        <div key={rule.id} className="card-shell space-y-3 p-4">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {rule.ip_address}
                                </span>
                                <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        rule.type === 'blacklist'
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    }`}
                                >
                                    {rule.type}
                                </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                {rule.reason || 'Tidak ada catatan.'}
                            </p>

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                                <button
                                    type="button"
                                    onClick={() => handleToggle(rule)}
                                    className={`badge badge-sm border-0 font-medium ${
                                        rule.is_active
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    {rule.is_active ? 'Aktif' : 'Nonaktif'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(rule)}
                                    className="btn btn-xs border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    )}
                />
            </div>

            {/* Modal Tambah Aturan IP */}
            {creatingRule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setCreatingRule(false)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="type-h3 text-slate-800 dark:text-slate-100">Tambah Aturan IP Baru</h3>
                            <button
                                type="button"
                                onClick={() => setCreatingRule(false)}
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                            <div>
                                <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">
                                    Alamat IP (IPv4 / IPv6)
                                </label>
                                <div className="mt-1 flex gap-2">
                                    <input
                                        type="text"
                                        value={ruleForm.ip_address}
                                        onChange={(e) => setRuleForm({ ...ruleForm, ip_address: e.target.value })}
                                        placeholder="Contoh: 192.168.1.100"
                                        className="input input-sm input-bordered w-full font-mono bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setRuleForm({ ...ruleForm, ip_address: stats.my_ip })}
                                        className="btn btn-sm shrink-0 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                                        title="Gunakan IP Anda saat ini"
                                    >
                                        IP Saya
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">
                                    Tipe Aturan
                                </label>
                                <select
                                    value={ruleForm.type}
                                    onChange={(e) => setRuleForm({ ...ruleForm, type: e.target.value })}
                                    className="select select-sm select-bordered w-full mt-1 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                >
                                    <option value="blacklist">Blacklist (Blokir total dengan 403)</option>
                                    <option value="whitelist">Whitelist (Izinkan akses prioritas)</option>
                                </select>
                            </div>

                            <div>
                                <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">
                                    Alasan / Keterangan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={ruleForm.reason}
                                    onChange={(e) => setRuleForm({ ...ruleForm, reason: e.target.value })}
                                    placeholder="Contoh: Terdeteksi spam login berulang kali"
                                    className="input input-sm input-bordered w-full mt-1 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                    maxLength={255}
                                />
                            </div>

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCreatingRule(false)}
                                    className="btn btn-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                                >
                                    Batal
                                </button>
                                <SolidButton processing={submitting}>
                                    Simpan Aturan
                                </SolidButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
