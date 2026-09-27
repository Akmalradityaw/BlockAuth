import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/data/DataTable';
import { StatCard } from '@/Components/data/Ui';
import SolidButton from '@/Components/forms/SolidButton';
import { showToast } from '@/Components/feedback/Toast';

export default function AnnouncementsIndex({ announcements, filters = {}, stats }) {
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        title: '',
        content: '',
        type: 'info',
        pinned: false,
    });
    const [submitting, setSubmitting] = useState(false);

    function applyFilter(newParams) {
        router.get(
            '/announcements',
            { ...filters, ...newParams },
            { preserveState: true, replace: true }
        );
    }

    function handleResetFilters() {
        router.get('/announcements', {}, { preserveState: true, replace: true });
    }

    function handleDelete(a) {
        if (!confirm(`Hapus pengumuman broadcast '${a.title}'?`)) return;

        router.delete(`/announcements/${a.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Pengumuman '${a.title}' berhasil dihapus.`, 'info', 'Pengumuman Dihapus');
            },
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        router.post('/announcements', form, {
            preserveScroll: true,
            onSuccess: () => {
                setCreating(false);
                setForm({ title: '', content: '', type: 'info', pinned: false });
                showToast('Pengumuman broadcast berhasil disiarkan kepada seluruh pengguna.', 'success', 'Pengumuman Disiarkan');
            },
            onFinish: () => setSubmitting(false),
        });
    }

    const columns = [
        { key: 'title', label: 'Judul & Konten Siaran', sortable: false },
        { key: 'type', label: 'Tipe', sortable: false },
        { key: 'pinned', label: 'Disematkan', sortable: false },
        { key: 'creator', label: 'Dibuat Oleh', sortable: false },
        { key: 'created_at', label: 'Waktu Siaran', sortable: false },
        { key: 'action', label: 'Aksi', sortable: false, headerClassName: 'text-right', className: 'text-right' },
    ];

    const hasActiveFilters = Boolean(filters.search || filters.type);

    return (
        <AppLayout
            eyebrow="Komunikasi & Siaran"
            title="Pusat Pengumuman Sistem"
            desc="Kelola pengumuman broadcast yang langsung dikirimkan ke pusat notifikasi topbar seluruh pengguna."
            actions={
                <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
                >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    Siarkan Pengumuman
                </button>
            }
        >
            <Head title="Pusat Pengumuman Sistem" />

            {/* Statistik Ringkasan */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Siaran" value={stats.total} note="Seluruh pengumuman yang pernah dibuat" />
                <StatCard label="Siaran Aktif" value={stats.active} note="Tampil di pusat notifikasi pengguna" />
                <StatCard label="Disematkan (Pinned)" value={stats.pinned} note="Prioritas di urutan paling atas" />
                <StatCard label="Total Pembaca" value={stats.total_reads} note="Jumlah pengguna yang telah membaca" />
            </div>

            {/* Tabel Data Interaktif */}
            <div className="mt-6">
                <DataTable
                    columns={columns}
                    data={announcements.data}
                    search={filters.search || ''}
                    onSearch={(val) => applyFilter({ search: val || undefined })}
                    searchPlaceholder="Cari judul atau isi pengumuman..."
                    filterSlot={
                        <>
                            <select
                                value={filters.type || ''}
                                onChange={(e) => applyFilter({ type: e.target.value || undefined })}
                                className="select select-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-[#6D28D9] focus:outline-none"
                            >
                                <option value="">Semua Kategori</option>
                                <option value="info">Info</option>
                                <option value="warning">Peringatan</option>
                                <option value="danger">Kritis / Bahaya</option>
                                <option value="success">Sukses</option>
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
                    pagination={announcements}
                    onPerPageChange={(perPage) => applyFilter({ per_page: perPage })}
                    emptyTitle="Tidak ada siaran pengumuman"
                    emptyMessage={hasActiveFilters ? 'Tidak ada pengumuman yang cocok dengan kriteria filter.' : 'Belum ada siaran pengumuman yang dibuat.'}
                    renderRow={(a) => (
                        <tr key={a.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                            <td className="py-3 pl-4">
                                <div className="max-w-md">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{a.title}</p>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{a.content}</p>
                                </div>
                            </td>
                            <td className="whitespace-nowrap">
                                <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                        a.type === 'danger'
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                            : a.type === 'warning'
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                            : a.type === 'success'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                    }`}
                                >
                                    {a.type}
                                </span>
                            </td>
                            <td className="whitespace-nowrap">
                                {a.pinned ? (
                                    <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                        Disematkan
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-400 dark:text-slate-500">Standar</span>
                                )}
                            </td>
                            <td className="whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                                {a.creator?.name || 'Administrator'}
                            </td>
                            <td className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                {new Date(a.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </td>
                            <td className="pr-4 text-right whitespace-nowrap">
                                <button
                                    type="button"
                                    onClick={() => handleDelete(a)}
                                    className="btn btn-xs border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    )}
                    renderMobileCard={(a) => (
                        <div key={a.id} className="card-shell space-y-3 p-4">
                            <div className="flex items-center justify-between">
                                <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        a.type === 'danger'
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                            : a.type === 'warning'
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                            : a.type === 'success'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                    }`}
                                >
                                    {a.type}
                                </span>
                                {a.pinned && (
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                        Disematkan
                                    </span>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{a.title}</h4>
                                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{a.content}</p>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>{a.creator?.name || 'Admin'}</span>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(a)}
                                    className="btn btn-xs border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    )}
                />
            </div>

            {/* Modal Tambah Siaran Baru */}
            {creating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setCreating(false)}
                    />
                    <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="type-h3 text-slate-800 dark:text-slate-100">Siarkan Pengumuman Baru</h3>
                            <button
                                type="button"
                                onClick={() => setCreating(false)}
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                            <div>
                                <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">
                                    Judul Pengumuman
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Contoh: Pembaruan Sistem Keamanan v2.4"
                                    className="input input-sm input-bordered w-full mt-1 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                    required
                                    maxLength={150}
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">
                                        Kategori / Prioritas
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="select select-sm select-bordered w-full mt-1 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                    >
                                        <option value="info">Info (Biru)</option>
                                        <option value="warning">Peringatan (Kuning)</option>
                                        <option value="danger">Kritis / Bahaya (Merah)</option>
                                        <option value="success">Sukses (Hijau)</option>
                                    </select>
                                </div>

                                <div className="flex flex-col justify-end">
                                    <label className="flex items-center gap-2.5 cursor-pointer pb-2">
                                        <input
                                            type="checkbox"
                                            checked={form.pinned}
                                            onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                                            className="checkbox checkbox-sm checkbox-primary"
                                        />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Sematkan di Atas (Pinned)
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">
                                    Isi Pesan Pengumuman
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    rows={4}
                                    placeholder="Tuliskan detail pengumuman yang ingin disampaikan kepada seluruh pengguna..."
                                    className="textarea textarea-bordered w-full mt-1 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs"
                                    required
                                    maxLength={1000}
                                />
                            </div>

                            {/* Live Preview */}
                            {form.title && (
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                            {form.type}
                                        </span>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{form.title}</p>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{form.content || 'Isi pengumuman...'}</p>
                                </div>
                            )}

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCreating(false)}
                                    className="btn btn-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                                >
                                    Batal
                                </button>
                                <SolidButton processing={submitting}>
                                    Siarkan Sekarang
                                </SolidButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
