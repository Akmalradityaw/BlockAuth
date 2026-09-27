import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/data/DataTable';
import { StatCard } from '@/Components/data/Ui';
import SolidButton from '@/Components/forms/SolidButton';
import { showToast } from '@/Components/feedback/Toast';

export default function SecurityTicketsIndex({ tickets, filters = {}, stats, securityStaff = [] }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.roles?.includes('SuperAdmin');

    const [creating, setCreating] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [form, setForm] = useState({
        subject: '',
        category: '2fa_reset',
        priority: 'medium',
        description: '',
    });
    const [saving, setSaving] = useState(false);

    const [replyMessage, setReplyMessage] = useState('');
    const [isInternalReply, setIsInternalReply] = useState(false);
    const [sendingReply, setSendingReply] = useState(false);

    function openCreate() {
        setForm({
            subject: '',
            category: '2fa_reset',
            priority: 'medium',
            description: '',
        });
        setCreating(true);
    }

    function handleCreate(e) {
        e.preventDefault();
        setSaving(true);

        router.post('/security/tickets', form, {
            preserveScroll: true,
            onSuccess: () => {
                setCreating(false);
                showToast('Tiket permohonan keamanan berhasil diajukan.', 'success');
            },
            onError: (err) => showToast(Object.values(err)[0] || 'Gagal membuat tiket.', 'error'),
            onFinish: () => setSaving(false),
        });
    }

    function handleReply(e) {
        e.preventDefault();
        if (!selectedTicket || !replyMessage.trim()) return;
        setSendingReply(true);

        router.post(`/security/tickets/${selectedTicket.id}/reply`, {
            message: replyMessage,
            is_internal: isInternalReply,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setReplyMessage('');
                showToast('Tanggapan berhasil dikirimkan.', 'success');
            },
            onError: () => showToast('Gagal mengirimkan tanggapan.', 'error'),
            onFinish: () => setSendingReply(false),
        });
    }

    function handleStatusChange(ticketId, newStatus) {
        router.put(`/security/tickets/${ticketId}/status`, {
            status: newStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => showToast(`Status tiket diperbarui menjadi '${newStatus}'.`, 'success'),
            onError: () => showToast('Gagal memperbarui status tiket.', 'error'),
        });
    }

    function handleDelete(ticket) {
        if (!confirm(`Hapus tiket #${ticket.ticket_number}?`)) return;

        router.delete(`/security/tickets/${ticket.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedTicket?.id === ticket.id) setSelectedTicket(null);
                showToast(`Tiket #${ticket.ticket_number} telah dihapus.`, 'info');
            },
            onError: () => showToast('Gagal menghapus tiket.', 'error'),
        });
    }

    const categoryLabels = {
        '2fa_reset': 'Reset Perangkat 2FA',
        'ip_appeal': 'Sanggahan Pemblokiran IP',
        'suspicious_activity': 'Aktivitas Mencurigakan',
        'general': 'Permohonan Umum',
    };

    const columns = [
        {
            key: 'ticket_number',
            label: 'No. Tiket & Subjek',
            render: (_, row) => (
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                            #{row.ticket_number}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{row.subject}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {categoryLabels[row.category] || row.category} &middot; Pelapor: {row.user?.name || 'User'}
                    </span>
                </div>
            ),
        },
        {
            key: 'priority',
            label: 'Prioritas',
            render: (_, row) => {
                const priorityStyles = {
                    critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
                    high: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                    low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
                };
                return (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${priorityStyles[row.priority] || priorityStyles.low}`}>
                        {row.priority}
                    </span>
                );
            },
        },
        {
            key: 'status',
            label: 'Status Penanganan',
            render: (_, row) => {
                const statusStyles = {
                    open: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
                    in_progress: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
                    resolved: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
                    closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                };
                return (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[row.status] || statusStyles.open}`}>
                        {row.status === 'open' && 'Baru (Open)'}
                        {row.status === 'in_progress' && 'Sedang Ditangani'}
                        {row.status === 'resolved' && 'Selesai (Resolved)'}
                        {row.status === 'closed' && 'Ditutup'}
                    </span>
                );
            },
        },
        {
            key: 'replies',
            label: 'Tanggapan',
            render: (_, row) => (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {row.replies?.length || 0} pesan
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={() => setSelectedTicket(row)}
                        className="btn btn-xs btn-brand border-0"
                    >
                        Buka Detail
                    </button>
                    {isSuperAdmin && (
                        <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            className="btn btn-xs btn-ghost text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                            Hapus
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout
            eyebrow="Keamanan & Jaringan"
            title="Tiket Permohonan & Insiden Keamanan"
            desc="Kelola pengajuan pemulihan akun, permohonan reset 2FA, sanggahan pemblokiran IP, dan investigasi anomali siber."
            actions={
                <SolidButton onClick={openCreate} tone="amber">
                    Buat Tiket Baru
                </SolidButton>
            }
        >
            <Head title="Tiket Permohonan & Insiden Keamanan" />

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Tiket"
                    value={stats.total}
                    hint="Laporan tercatat"
                />
                <StatCard
                    label="Menunggu Respon"
                    value={stats.open}
                    hint="Tiket baru (Open)"
                />
                <StatCard
                    label="Sedang Ditangani"
                    value={stats.in_progress}
                    hint="Investigasi tim"
                />
                <StatCard
                    label="Kasus Kritis"
                    value={stats.critical}
                    hint="Prioritas tinggi belum tuntas"
                />
            </div>

            <DataTable
                columns={columns}
                data={tickets.data}
                pagination={tickets}
                searchRoute="/security/tickets"
                searchPlaceholder="Cari nomor tiket, subjek, atau kronologi deskripsi..."
                filters={[
                    {
                        key: 'status',
                        label: 'Status Penanganan',
                        value: filters.status ?? '',
                        options: [
                            { value: 'open', label: 'Baru (Open)' },
                            { value: 'in_progress', label: 'Sedang Ditangani' },
                            { value: 'resolved', label: 'Selesai (Resolved)' },
                            { value: 'closed', label: 'Ditutup (Closed)' },
                        ],
                    },
                    {
                        key: 'priority',
                        label: 'Tingkat Prioritas',
                        value: filters.priority ?? '',
                        options: [
                            { value: 'critical', label: 'Kritis (Critical)' },
                            { value: 'high', label: 'Tinggi (High)' },
                            { value: 'medium', label: 'Sedang (Medium)' },
                            { value: 'low', label: 'Rendah (Low)' },
                        ],
                    },
                    {
                        key: 'category',
                        label: 'Kategori Laporan',
                        value: filters.category ?? '',
                        options: [
                            { value: '2fa_reset', label: 'Reset Perangkat 2FA' },
                            { value: 'ip_appeal', label: 'Sanggahan Pemblokiran IP' },
                            { value: 'suspicious_activity', label: 'Aktivitas Mencurigakan' },
                            { value: 'general', label: 'Permohonan Umum' },
                        ],
                    },
                ]}
            />

            {/* Modal Buat Tiket Baru */}
            {creating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                Ajukan Tiket Permohonan / Insiden Keamanan
                            </h3>
                            <button
                                type="button"
                                onClick={() => setCreating(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Subjek Laporan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    placeholder="Contoh: Permohonan Reset Perangkat 2FA Hilang"
                                    className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Kategori Masalah
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="select select-sm select-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                    >
                                        <option value="2fa_reset">Reset Perangkat 2FA</option>
                                        <option value="ip_appeal">Sanggahan Pemblokiran IP</option>
                                        <option value="suspicious_activity">Aktivitas Mencurigakan</option>
                                        <option value="general">Permohonan Umum</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Tingkat Prioritas
                                    </label>
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                        className="select select-sm select-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                    >
                                        <option value="low">Rendah (Low)</option>
                                        <option value="medium">Sedang (Medium)</option>
                                        <option value="high">Tinggi (High)</option>
                                        <option value="critical">Kritis (Critical)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Deskripsi Kronologi Masalah
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Jelaskan detail kendala, perkiraan waktu terjadinya kejadian, atau alasan pemulihan akun..."
                                    className="textarea textarea-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCreating(false)}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-sm btn-brand border-0"
                                >
                                    {saving ? 'Mengajukan...' : 'Kirim Tiket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail Tiket & Thread Tanggapan */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="flex flex-col h-[85vh] w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400">
                                        #{selectedTicket.ticket_number}
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                        {selectedTicket.subject}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kategori: {categoryLabels[selectedTicket.category] || selectedTicket.category} &middot; Pelapor: {selectedTicket.user?.name} ({selectedTicket.user?.email})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTicket(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Kontrol Status oleh Administrator */}
                        {isSuperAdmin && (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-800/30 text-xs">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">Ubah Status Tiket:</span>
                                <div className="flex gap-1.5">
                                    {['open', 'in_progress', 'resolved', 'closed'].map((st) => (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => handleStatusChange(selectedTicket.id, st)}
                                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                                selectedTicket.status === st
                                                    ? 'bg-violet-600 text-white'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Thread Percakapan */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Deskripsi Pembuka Laporan */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                        Deskripsi Pengajuan oleh {selectedTicket.user?.name}
                                    </span>
                                    <span className="text-[11px] text-slate-400">Laporan Awal</span>
                                </div>
                                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                    {selectedTicket.description}
                                </p>
                            </div>

                            {/* Daftar Balasan */}
                            {selectedTicket.replies?.map((rep) => (
                                <div
                                    key={rep.id}
                                    className={`rounded-2xl p-4 text-xs ${
                                        rep.is_internal
                                            ? 'border border-amber-300/80 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/20'
                                            : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/80'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 dark:text-slate-100">{rep.user?.name}</span>
                                            {rep.is_internal && (
                                                <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                                    Catatan Internal Tim
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400">{rep.created_at || 'Baru saja'}</span>
                                    </div>
                                    <p className="leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                        {rep.message}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Form Kirim Tanggapan */}
                        <form onSubmit={handleReply} className="border-t border-slate-100 p-4 dark:border-slate-800">
                            <div className="flex flex-col gap-2">
                                <textarea
                                    rows={2}
                                    required
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Tuliskan tanggapan balasan atau petunjuk penyelesaian masalah..."
                                    className="textarea textarea-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                                />
                                <div className="flex items-center justify-between">
                                    {isSuperAdmin ? (
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={isInternalReply}
                                                onChange={(e) => setIsInternalReply(e.target.checked)}
                                                className="checkbox checkbox-xs checkbox-primary"
                                            />
                                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                                Simpan sebagai catatan investigasi internal
                                            </span>
                                        </label>
                                    ) : <div />}

                                    <button
                                        type="submit"
                                        disabled={sendingReply}
                                        className="btn btn-sm btn-brand border-0"
                                    >
                                        {sendingReply ? 'Mengirim...' : 'Kirim Tanggapan'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
