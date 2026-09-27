import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/data/DataTable';
import { StatCard } from '@/Components/data/Ui';
import SolidButton from '@/Components/forms/SolidButton';
import { showToast } from '@/Components/feedback/Toast';

export default function AccessPoliciesIndex({ policies, filters = {}, stats }) {
    const [creating, setCreating] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);

    const [form, setForm] = useState({
        name: '',
        type: 'geofencing',
        action: 'block',
        description: '',
        rules: {
            countries: 'KP, IR, SY',
            start_time: '08:00',
            end_time: '18:00',
            block_tor: true,
            block_proxy: true,
        },
    });
    const [saving, setSaving] = useState(false);

    function openCreate() {
        setForm({
            name: '',
            type: 'geofencing',
            action: 'block',
            description: '',
            rules: {
                countries: 'KP, IR, SY',
                start_time: '08:00',
                end_time: '18:00',
                block_tor: true,
                block_proxy: true,
            },
        });
        setCreating(true);
    }

    function openEdit(p) {
        setEditingPolicy(p);
        const r = p.rules || {};
        setForm({
            name: p.name,
            type: p.type,
            action: p.action,
            description: p.description || '',
            rules: {
                countries: Array.isArray(r.blocked_countries) ? r.blocked_countries.join(', ') : (r.countries || 'KP, IR, SY'),
                start_time: r.start_time || '08:00',
                end_time: r.end_time || '18:00',
                block_tor: r.block_tor ?? r.block_tor_exit_nodes ?? true,
                block_proxy: r.block_proxy ?? r.block_anonymous_proxy ?? true,
            },
        });
    }

    function handleSave(e) {
        e.preventDefault();
        setSaving(true);

        const payload = {
            name: form.name,
            type: form.type,
            action: form.action,
            description: form.description,
            rules: {},
        };

        if (form.type === 'geofencing') {
            payload.rules = {
                blocked_countries: form.rules.countries.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean),
            };
        } else if (form.type === 'time_restriction') {
            payload.rules = {
                start_time: form.rules.start_time,
                end_time: form.rules.end_time,
            };
        } else {
            payload.rules = {
                block_tor_exit_nodes: !!form.rules.block_tor,
                block_anonymous_proxy: !!form.rules.block_proxy,
            };
        }

        if (editingPolicy) {
            router.put(`/security/policies/${editingPolicy.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingPolicy(null);
                    showToast('Kebijakan akses berhasil diperbarui.', 'success');
                },
                onError: () => showToast('Gagal memperbarui kebijakan.', 'error'),
                onFinish: () => setSaving(false),
            });
        } else {
            router.post('/security/policies', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setCreating(false);
                    showToast('Kebijakan akses baru berhasil disimpan.', 'success');
                },
                onError: () => showToast('Gagal menyimpan kebijakan akses.', 'error'),
                onFinish: () => setSaving(false),
            });
        }
    }

    function handleToggle(p) {
        router.post(`/security/policies/${p.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => showToast(`Status aturan '${p.name}' berhasil diubah.`, 'success'),
            onError: () => showToast('Gagal mengubah status aturan.', 'error'),
        });
    }

    function handleDelete(p) {
        if (!confirm(`Hapus aturan kebijakan '${p.name}'?`)) return;

        router.delete(`/security/policies/${p.id}`, {
            preserveScroll: true,
            onSuccess: () => showToast(`Kebijakan '${p.name}' telah dihapus.`, 'info'),
            onError: () => showToast('Gagal menghapus kebijakan.', 'error'),
        });
    }

    const typeLabels = {
        geofencing: 'Geofencing Wilayah',
        time_restriction: 'Jadwal Jam Kerja',
        connection_security: 'Keamanan Koneksi (Tor/Proxy)',
    };

    const columns = [
        {
            key: 'name',
            label: 'Nama Kebijakan & Deskripsi',
            render: (_, row) => (
                <div>
                    <span className="block font-semibold text-slate-900 dark:text-slate-100">{row.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{row.description || '-'}</span>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Kategori Kontrol',
            render: (_, row) => (
                <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {typeLabels[row.type] || row.type}
                </span>
            ),
        },
        {
            key: 'rules',
            label: 'Ketentuan & Parameter',
            render: (_, row) => {
                const r = row.rules || {};
                return (
                    <div className="text-xs">
                        {row.type === 'geofencing' && (
                            <span className="font-mono text-slate-600 dark:text-slate-400">
                                Negara: {Array.isArray(r.blocked_countries) ? r.blocked_countries.join(', ') : 'Semua'}
                            </span>
                        )}
                        {row.type === 'time_restriction' && (
                            <span className="font-mono text-slate-600 dark:text-slate-400">
                                Jam: {r.start_time || '08:00'} - {r.end_time || '18:00'}
                            </span>
                        )}
                        {row.type === 'connection_security' && (
                            <span className="font-mono text-slate-600 dark:text-slate-400">
                                Tor & Proxy Anonim: Terproteksi
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'action',
            label: 'Aksi Sistem',
            render: (_, row) => (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    row.action === 'block'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                    {row.action === 'block' ? 'Blokir' : 'Izinkan'}
                </span>
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
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${row.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
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
                        onClick={() => handleDelete(row)}
                        className="btn btn-xs btn-ghost text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                        Hapus
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout
            eyebrow="Keamanan & Jaringan"
            title="Kebijakan Akses Kontekstual & Geofencing"
            desc="Terapkan pembatasan masuk berbasis negara (GeoIP), jadwal operasional jam kerja kantor, dan mitigasi koneksi proxy anonim."
            actions={
                <SolidButton onClick={openCreate} tone="amber">
                    Tambah Aturan Kebijakan
                </SolidButton>
            }
        >
            <Head title="Kebijakan Akses Kontekstual & Geofencing" />

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Kebijakan"
                    value={stats.total}
                    hint="Aturan terpasang"
                />
                <StatCard
                    label="Kebijakan Aktif"
                    value={stats.active}
                    hint="Berjalan di firewall"
                />
                <StatCard
                    label="Aturan Geofencing"
                    value={stats.geofencing}
                    hint="Filter batas wilayah"
                />
                <StatCard
                    label="Proteksi Koneksi"
                    value={stats.connection}
                    hint="Anti-proxy & Tor"
                />
            </div>

            <DataTable
                columns={columns}
                data={policies.data}
                pagination={policies}
                searchRoute="/security/policies"
                searchPlaceholder="Cari kebijakan berdasarkan nama atau deskripsi..."
                filters={[
                    {
                        key: 'type',
                        label: 'Kategori Kontrol',
                        value: filters.type ?? '',
                        options: [
                            { value: 'geofencing', label: 'Geofencing Wilayah' },
                            { value: 'time_restriction', label: 'Jadwal Jam Kerja' },
                            { value: 'connection_security', label: 'Keamanan Koneksi' },
                        ],
                    },
                    {
                        key: 'action',
                        label: 'Tindakan Sistem',
                        value: filters.action ?? '',
                        options: [
                            { value: 'block', label: 'Blokir Akses' },
                            { value: 'allow', label: 'Izinkan Akses' },
                        ],
                    },
                    {
                        key: 'is_active',
                        label: 'Status Aturan',
                        value: filters.is_active ?? '',
                        options: [
                            { value: '1', label: 'Aktif Saja' },
                            { value: '0', label: 'Nonaktif Saja' },
                        ],
                    },
                ]}
            />

            {/* Modal Tambah / Edit Kebijakan */}
            {(creating || editingPolicy) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                {editingPolicy ? 'Sunting Aturan Kebijakan Akses' : 'Buat Aturan Kebijakan Akses Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => { setCreating(false); setEditingPolicy(null); }}
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
                                    Nama Aturan Kebijakan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Pemblokiran Wilayah Risiko Tinggi"
                                    className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Tipe Kontrol
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="select select-sm select-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                    >
                                        <option value="geofencing">Geofencing Wilayah</option>
                                        <option value="time_restriction">Jadwal Jam Kerja</option>
                                        <option value="connection_security">Keamanan Koneksi (Tor/Proxy)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Tindakan Firewall
                                    </label>
                                    <select
                                        value={form.action}
                                        onChange={(e) => setForm({ ...form, action: e.target.value })}
                                        className="select select-sm select-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                    >
                                        <option value="block">Blokir Akses (403)</option>
                                        <option value="allow">Izinkan Akses</option>
                                    </select>
                                </div>
                            </div>

                            {/* Konfigurasi Dinamis berdasarkan Tipe */}
                            {form.type === 'geofencing' && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Kode Negara ISO (Pisahkan dengan koma)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.rules.countries}
                                        onChange={(e) => setForm({ ...form, rules: { ...form.rules, countries: e.target.value } })}
                                        placeholder="Contoh: KP, IR, SY, RU"
                                        className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs uppercase"
                                    />
                                    <span className="text-[11px] text-slate-400">Gunakan format 2 huruf ISO-3166 (misal: ID, US, SG).</span>
                                </div>
                            )}

                            {form.type === 'time_restriction' && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                    <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Rentang Jam Operasional yang Diizinkan
                                    </span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] text-slate-500">Mulai Jam</label>
                                            <input
                                                type="time"
                                                required
                                                value={form.rules.start_time}
                                                onChange={(e) => setForm({ ...form, rules: { ...form.rules, start_time: e.target.value } })}
                                                className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-slate-500">Sampai Jam</label>
                                            <input
                                                type="time"
                                                required
                                                value={form.rules.end_time}
                                                onChange={(e) => setForm({ ...form, rules: { ...form.rules, end_time: e.target.value } })}
                                                className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {form.type === 'connection_security' && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.rules.block_tor}
                                            onChange={(e) => setForm({ ...form, rules: { ...form.rules, block_tor: e.target.checked } })}
                                            className="checkbox checkbox-sm checkbox-primary"
                                        />
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                            Blokir node keluar jaringan Tor (Tor Exit Nodes)
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.rules.block_proxy}
                                            onChange={(e) => setForm({ ...form, rules: { ...form.rules, block_proxy: e.target.checked } })}
                                            className="checkbox checkbox-sm checkbox-primary"
                                        />
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                            Blokir proxy anonim & VPN pusat data (Datacenter VPN)
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Deskripsi Catatan Kebijakan
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Alasan penegakan aturan atau referensi kepatuhan..."
                                    className="textarea textarea-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setCreating(false); setEditingPolicy(null); }}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-sm btn-brand border-0"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Kebijakan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
