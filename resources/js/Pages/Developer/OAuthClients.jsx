import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/data/DataTable';
import { StatCard } from '@/Components/data/Ui';
import SolidButton from '@/Components/forms/SolidButton';
import { showToast } from '@/Components/feedback/Toast';

export default function OAuthClientsIndex({ clients, filters = {}, stats, availableScopes = [] }) {
    const [creating, setCreating] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [revealedSecrets, setRevealedSecrets] = useState({});

    const [form, setForm] = useState({
        name: '',
        redirect_uri: '',
        scopes: ['profile', 'email'],
    });
    const [saving, setSaving] = useState(false);

    function toggleSecretVisibility(id) {
        setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    function copyToClipboard(text, label) {
        navigator.clipboard.writeText(text);
        showToast(`${label} berhasil disalin ke papan klip.`, 'success');
    }

    function openCreate() {
        setForm({
            name: '',
            redirect_uri: '',
            scopes: ['profile', 'email'],
        });
        setCreating(true);
    }

    function openEdit(cl) {
        setEditingClient(cl);
        
        let parsedScopes = ['profile', 'email'];
        if (Array.isArray(cl.scopes)) {
            parsedScopes = cl.scopes;
        } else if (typeof cl.scopes === 'string') {
            try {
                const p = JSON.parse(cl.scopes);
                if (Array.isArray(p)) parsedScopes = p;
                else parsedScopes = [];
            } catch {
                parsedScopes = [];
            }
        }
        
        if (!Array.isArray(parsedScopes)) {
            parsedScopes = [];
        }

        setForm({
            name: cl.name,
            redirect_uri: cl.redirect_uri,
            scopes: parsedScopes,
        });
    }

    function handleSave(e) {
        e.preventDefault();
        setSaving(true);

        if (editingClient) {
            router.put(`/developer/oauth-clients/${editingClient.id}`, form, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingClient(null);
                    showToast('Konfigurasi aplikasi berhasil diperbarui.', 'success');
                },
                onError: () => showToast('Gagal memperbarui aplikasi.', 'error'),
                onFinish: () => setSaving(false),
            });
        } else {
            router.post('/developer/oauth-clients', form, {
                preserveScroll: true,
                onSuccess: () => {
                    setCreating(false);
                    showToast('Aplikasi OAuth baru berhasil didaftarkan.', 'success');
                },
                onError: () => showToast('Gagal mendaftarkan aplikasi.', 'error'),
                onFinish: () => setSaving(false),
            });
        }
    }

    function handleToggle(cl) {
        router.post(`/developer/oauth-clients/${cl.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => showToast(`Status aplikasi '${cl.name}' diperbarui.`, 'success'),
            onError: () => showToast('Gagal memperbarui status aplikasi.', 'error'),
        });
    }

    function handleRegenerateSecret(cl) {
        if (!confirm(`PENTING: Regenerasi client secret untuk '${cl.name}' akan membatalkan secret lama segera. Lanjutkan?`)) return;

        router.post(`/developer/oauth-clients/${cl.id}/regenerate-secret`, {}, {
            preserveScroll: true,
            onSuccess: () => showToast('Client Secret baru berhasil dibuat.', 'success'),
            onError: () => showToast('Gagal meregenerasi client secret.', 'error'),
        });
    }

    function handleDelete(cl) {
        if (!confirm(`Hapus aplikasi '${cl.name}'? Seluruh integrasi pihak ketiga akan terputus permanen.`)) return;

        router.delete(`/developer/oauth-clients/${cl.id}`, {
            preserveScroll: true,
            onSuccess: () => showToast(`Aplikasi '${cl.name}' telah dihapus.`, 'info'),
            onError: () => showToast('Gagal menghapus aplikasi.', 'error'),
        });
    }

    function handleScopeToggle(scopeKey) {
        if (form.scopes.includes(scopeKey)) {
            if (form.scopes.length === 1) {
                showToast('Aplikasi wajib memiliki minimal satu izin akses (scope).', 'warning');
                return;
            }
            setForm({ ...form, scopes: form.scopes.filter((s) => s !== scopeKey) });
        } else {
            setForm({ ...form, scopes: [...form.scopes, scopeKey] });
        }
    }

    const columns = [
        {
            key: 'name',
            label: 'Aplikasi Developer',
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 font-bold text-indigo-700 dark:text-indigo-300">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </span>
                    <div>
                        <span className="block font-semibold text-slate-900 dark:text-slate-100">{row.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Oleh: {row.user?.name || 'Sistem'}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'credentials',
            label: 'Kredensial Klien (Client ID & Secret)',
            render: (_, row) => (
                <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {row.client_id}
                        </span>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(row.client_id, 'Client ID')}
                            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Salin ID
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                            {revealedSecrets[row.id] ? row.client_secret : 'ba_sec_••••••••••••••••'}
                        </span>
                        <button
                            type="button"
                            onClick={() => toggleSecretVisibility(row.id)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                            {revealedSecrets[row.id] ? 'Sembunyikan' : 'Buka'}
                        </button>
                        {revealedSecrets[row.id] && (
                            <button
                                type="button"
                                onClick={() => copyToClipboard(row.client_secret, 'Client Secret')}
                                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                            >
                                Salin Secret
                            </button>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'redirect_uri',
            label: 'Callback URL & Scopes',
            render: (_, row) => (
                <div className="flex flex-col gap-1 max-w-xs">
                    <span className="truncate text-xs font-mono text-slate-700 dark:text-slate-300" title={row.redirect_uri}>
                        {row.redirect_uri}
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {(() => {
                            let arr = [];
                            if (Array.isArray(row.scopes)) arr = row.scopes;
                            else if (typeof row.scopes === 'string') {
                                try { 
                                    const parsed = JSON.parse(row.scopes); 
                                    if (Array.isArray(parsed)) arr = parsed;
                                } catch(e) { arr = []; }
                            }
                            
                            if (!Array.isArray(arr)) arr = [];
                            
                            return arr.map((s) => (
                                <span key={s} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                    {s}
                                </span>
                            ));
                        })()}
                    </div>
                </div>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (_, row) => (
                <button
                    type="button"
                    onClick={() => handleToggle(row)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer ${
                        row.is_active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                    }`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${row.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {row.is_active ? 'Aktif' : 'Dicabut'}
                </button>
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
                        onClick={() => openEdit(row)}
                        className="btn btn-xs btn-ghost text-slate-600 dark:text-slate-300"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRegenerateSecret(row)}
                        className="btn btn-xs btn-ghost text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        title="Buat Secret Baru"
                    >
                        Reset Secret
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="btn btn-xs btn-ghost text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                        Hapus
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout
            eyebrow="Integrasi & Siaran"
            title="Klien OAuth & Aplikasi Pengembang"
            desc="Kelola kredensial Client ID dan Secret untuk aplikasi pihak ketiga yang terintegrasi via Single Sign-On (SSO)."
            actions={
                <SolidButton onClick={openCreate} tone="amber">
                    Daftarkan Aplikasi
                </SolidButton>
            }
        >
            <Head title="Klien OAuth & Aplikasi Pengembang" />

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Aplikasi"
                    value={stats.total}
                    hint="Klien terdaftar"
                />
                <StatCard
                    label="Aplikasi Aktif"
                    value={stats.active}
                    hint="Koneksi terotorisasi"
                />
                <StatCard
                    label="Protokol"
                    value="OAuth 2.0"
                    hint="Standar industri SSO"
                />
                <StatCard
                    label="Tipe Kredensial"
                    value="HMAC / Secret"
                    hint="Key rotasi mandiri"
                />
            </div>

            <DataTable
                columns={columns}
                data={clients.data}
                pagination={clients}
                searchRoute="/developer/oauth-clients"
                searchPlaceholder="Cari aplikasi berdasarkan nama, client ID, atau URL callback..."
                filters={[
                    {
                        key: 'is_active',
                        label: 'Status Aplikasi',
                        value: filters.is_active ?? '',
                        options: [
                            { value: '1', label: 'Aktif Saja' },
                            { value: '0', label: 'Dicabut / Nonaktif' },
                        ],
                    },
                ]}
            />

            {/* Modal Tambah / Edit Aplikasi OAuth */}
            {(creating || editingClient) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                {editingClient ? 'Sunting Konfigurasi Klien OAuth' : 'Daftarkan Aplikasi Klien Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => { setCreating(false); setEditingClient(null); }}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Aplikasi Klien
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Portal Internal Pegawai Mobile"
                                    className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Redirect URI / Callback URL
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={form.redirect_uri}
                                    onChange={(e) => setForm({ ...form, redirect_uri: e.target.value })}
                                    placeholder="https://app.anda.com/oauth/callback"
                                    className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                                />
                                <span className="text-[11px] text-slate-400">Endpoint penerima token authorization code setelah autentikasi berhasil.</span>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Cakupan Izin Akses (Scopes)
                                </label>
                                <div className="space-y-2">
                                    {availableScopes.map((sc) => (
                                        <label
                                            key={sc.key}
                                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                                form.scopes.includes(sc.key)
                                                    ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-500/50 dark:bg-indigo-950/20'
                                                    : 'border-slate-200 dark:border-slate-800'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.scopes.includes(sc.key)}
                                                onChange={() => handleScopeToggle(sc.key)}
                                                className="checkbox checkbox-sm checkbox-primary mt-0.5"
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{sc.label}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{sc.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setCreating(false); setEditingClient(null); }}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-sm btn-brand border-0"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Aplikasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
