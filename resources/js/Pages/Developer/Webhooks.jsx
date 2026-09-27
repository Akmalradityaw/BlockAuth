import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatCard } from '@/Components/data/Ui';
import SolidButton from '@/Components/forms/SolidButton';
import { showToast } from '@/Components/feedback/Toast';

export default function WebhooksIndex({ webhooks = [], stats, availableEvents = [] }) {
    const [creatingWebhook, setCreatingWebhook] = useState(false);
    const [webhookForm, setWebhookForm] = useState({
        name: '',
        url: '',
        events: ['auth.login', 'auth.lockout'],
    });
    const [submitting, setSubmitting] = useState(false);
    const [selectedDeliveries, setSelectedDeliveries] = useState(null);
    const [pingingId, setPingingId] = useState(null);
    const [revealedSecrets, setRevealedSecrets] = useState({});

    function toggleSecret(id) {
        setRevealedSecrets((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }

    function copyToClipboard(text, label = 'Secret Key') {
        navigator.clipboard.writeText(text);
        showToast(`${label} berhasil disalin ke papan klip.`, 'success', 'Disalin');
    }

    function handleToggleWebhook(wh) {
        router.post(`/settings/webhooks/${wh.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Webhook '${wh.name}' berhasil diperbarui statusnya.`, 'success', 'Status Diperbarui');
            },
        });
    }

    function handleDeleteWebhook(wh) {
        if (!confirm(`Hapus endpoint webhook '${wh.name}'? Seluruh riwayat pengiriman juga akan dibersihkan.`)) return;

        router.delete(`/settings/webhooks/${wh.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Webhook '${wh.name}' telah dihapus.`, 'info', 'Webhook Dihapus');
            },
        });
    }

    function handlePingWebhook(wh) {
        setPingingId(wh.id);
        router.post(`/settings/webhooks/${wh.id}/ping`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Test ping terkirim ke '${wh.url}'. Cek riwayat pengiriman untuk respon HTTP.`, 'info', 'Test Ping Terkirim');
            },
            onFinish: () => setPingingId(null),
        });
    }

    function handleCreateSubmit(e) {
        e.preventDefault();
        if (webhookForm.events.length === 0) {
            showToast('Pilih minimal satu event yang ingin dilanggan.', 'error', 'Event Wajib Dipilih');
            return;
        }

        setSubmitting(true);
        router.post('/settings/webhooks', webhookForm, {
            preserveScroll: true,
            onSuccess: () => {
                setCreatingWebhook(false);
                setWebhookForm({ name: '', url: '', events: ['auth.login', 'auth.lockout'] });
                showToast('Endpoint webhook baru berhasil didaftarkan.', 'success', 'Webhook Terdaftar');
            },
            onFinish: () => setSubmitting(false),
        });
    }

    function toggleEventSelection(evKey) {
        setWebhookForm((prev) => {
            const exists = prev.events.includes(evKey);
            const next = exists ? prev.events.filter((k) => k !== evKey) : [...prev.events, evKey];
            return { ...prev, events: next };
        });
    }

    return (
        <AppLayout
            eyebrow="Integrasi & API"
            title="Webhook Eksternal"
            desc="Kirimkan event autentikasi secara instan via HTTP POST bertanda tangan HMAC-SHA256 ke microservice atau aplikasi pihak ketiga Anda."
            actions={
                <button
                    type="button"
                    onClick={() => setCreatingWebhook(true)}
                    className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
                >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Webhook
                </button>
            }
        >
            <Head title="Webhook Eksternal" />

            {/* Statistik Ringkasan */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Endpoint" value={stats.total} note="Webhook yang terkonfigurasi" />
                <StatCard label="Webhook Aktif" value={stats.active} note="Endpoint siap menerima event" />
                <StatCard label="Total Pengiriman" value={stats.total_deliveries} note="Akumulasi seluruh payload event" />
                <StatCard label="Rasio Sukses (2xx)" value={`${stats.success_rate}%`} note="Persentase respon HTTP sukses" />
            </div>

            {/* Daftar Webhook */}
            <div className="mt-6">
                {webhooks.length === 0 ? (
                    <div className="card-shell flex flex-col items-center justify-center p-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">Belum ada webhook yang didaftarkan</h3>
                        <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                            Hubungkan BlockAuth ke API eksternal Anda untuk menerima notifikasi real-time saat pengguna login, registrasi, atau mengalami lockout.
                        </p>
                        <button
                            type="button"
                            onClick={() => setCreatingWebhook(true)}
                            className="btn btn-sm btn-brand mt-4 border-0"
                        >
                            Daftarkan Webhook Pertama
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {webhooks.map((wh) => (
                            <div key={wh.id} className="card-shell p-5 transition-shadow hover:shadow-md">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{wh.name}</h3>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleWebhook(wh)}
                                                className={`badge badge-sm border-0 font-medium cursor-pointer transition-colors ${
                                                    wh.is_active
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}
                                            >
                                                {wh.is_active ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 break-all">
                                                {wh.url}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(wh.url, 'URL Webhook')}
                                                className="btn btn-ghost btn-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                title="Salin URL"
                                            >
                                                Salin
                                            </button>
                                        </div>

                                        {/* Secret Key Display */}
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Signing Secret:</span>
                                            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                {revealedSecrets[wh.id] ? wh.secret : '••••••••••••••••••••••••••••••••'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => toggleSecret(wh.id)}
                                                className="text-[11px] font-semibold text-[#6D28D9] dark:text-violet-400 hover:underline"
                                            >
                                                {revealedSecrets[wh.id] ? 'Sembunyikan' : 'Lihat'}
                                            </button>
                                            {revealedSecrets[wh.id] && (
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(wh.secret, 'Signing Secret')}
                                                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                                >
                                                    Salin
                                                </button>
                                            )}
                                        </div>

                                        {/* Badges Event yang Dilanggan */}
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {wh.events?.map((ev) => (
                                                <span
                                                    key={ev}
                                                    className="rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2 py-0.5 font-mono text-[10px] font-semibold text-purple-700 dark:text-purple-300"
                                                >
                                                    {ev}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={pingingId === wh.id}
                                            onClick={() => handlePingWebhook(wh)}
                                            className="btn btn-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        >
                                            {pingingId === wh.id ? 'Mengirim...' : 'Test Ping'}
                                        </button>

                                        {wh.deliveries?.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedDeliveries(wh)}
                                                className="btn btn-sm border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                                            >
                                                Riwayat ({wh.deliveries.length})
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteWebhook(wh)}
                                            className="btn btn-sm border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Tambah Webhook Baru */}
            {creatingWebhook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setCreatingWebhook(false)}
                    />
                    <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="type-h3 text-slate-800 dark:text-slate-100">Daftarkan Webhook Baru</h3>
                            <button
                                type="button"
                                onClick={() => setCreatingWebhook(false)}
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="mt-4 flex flex-col gap-4">
                            <div>
                                <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Endpoint / Sistem
                                </label>
                                <input
                                    type="text"
                                    value={webhookForm.name}
                                    onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                                    placeholder="Contoh: Server Audit Utama / Slack Bot"
                                    className="input input-sm input-bordered w-full mt-1 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                    required
                                    maxLength={100}
                                />
                            </div>

                            <div>
                                <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300">
                                    Target URL (HTTP / HTTPS)
                                </label>
                                <input
                                    type="url"
                                    value={webhookForm.url}
                                    onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                                    placeholder="https://api.domainanda.com/webhooks/blockauth"
                                    className="input input-sm input-bordered w-full mt-1 font-mono bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                    required
                                    maxLength={255}
                                />
                            </div>

                            <div>
                                <label className="type-caption block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Pilih Event yang Ingin Dilanggan
                                </label>
                                <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3 max-h-52 overflow-y-auto">
                                    {availableEvents.map((ev) => {
                                        const checked = webhookForm.events.includes(ev.key);
                                        return (
                                            <label
                                                key={ev.key}
                                                className={`flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors ${
                                                    checked ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleEventSelection(ev.key)}
                                                    className="checkbox checkbox-sm checkbox-primary mt-0.5"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ev.label}</span>
                                                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">({ev.key})</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{ev.desc}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCreatingWebhook(false)}
                                    className="btn btn-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                                >
                                    Batal
                                </button>
                                <SolidButton processing={submitting}>
                                    Daftarkan Webhook
                                </SolidButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Riwayat Pengiriman Webhook */}
            {selectedDeliveries && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedDeliveries(null)}
                    />
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="type-h3 text-slate-800 dark:text-slate-100">Riwayat Pengiriman Webhook</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedDeliveries.name} • {selectedDeliveries.url}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedDeliveries(null)}
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                            {selectedDeliveries.deliveries?.length === 0 ? (
                                <p className="p-4 text-center text-xs text-slate-500 italic">Belum ada catatan pengiriman event.</p>
                            ) : (
                                selectedDeliveries.deliveries.map((del) => (
                                    <div key={del.id} className="p-3 text-xs space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                                        del.response_status >= 200 && del.response_status < 300
                                                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                                    }`}
                                                >
                                                    {del.response_status ? `HTTP ${del.response_status}` : 'Koneksi Gagal'}
                                                </span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{del.event}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                <span>{del.duration_ms}ms</span>
                                                <span>•</span>
                                                <span>{new Date(del.created_at).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>

                                        {del.response_body && (
                                            <div className="rounded-lg bg-slate-900 p-2 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                                                Respon: {del.response_body}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedDeliveries(null)}
                                className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
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
