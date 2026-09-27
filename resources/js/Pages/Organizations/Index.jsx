import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/data/DataTable';
import { StatCard } from '@/Components/data/Ui';
import SolidButton from '@/Components/forms/SolidButton';
import { showToast } from '@/Components/feedback/Toast';

export default function OrganizationsIndex({ organizations, filters = {}, stats, availableUsers = [] }) {
    const { auth } = usePage().props;
    const [creating, setCreating] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);
    const [managingMembersOrg, setManagingMembersOrg] = useState(null);

    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        max_members: 50,
        is_active: true,
    });
    const [saving, setSaving] = useState(false);

    const [memberForm, setMemberForm] = useState({
        user_id: availableUsers[0]?.id || '',
        role: 'member',
    });
    const [addingMember, setAddingMember] = useState(false);

    function openCreate() {
        setForm({
            name: '',
            slug: '',
            description: '',
            max_members: 50,
            is_active: true,
        });
        setCreating(true);
    }

    function openEdit(org) {
        setEditingOrg(org);
        setForm({
            name: org.name,
            slug: org.slug,
            description: org.description || '',
            max_members: org.max_members || 50,
            is_active: !!org.is_active,
        });
    }

    function handleSave(e) {
        e.preventDefault();
        setSaving(true);

        if (editingOrg) {
            router.put(`/organizations/${editingOrg.id}`, form, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingOrg(null);
                    showToast('Informasi organisasi berhasil diperbarui.', 'success');
                },
                onError: () => showToast('Gagal memperbarui organisasi.', 'error'),
                onFinish: () => setSaving(false),
            });
        } else {
            router.post('/organizations', form, {
                preserveScroll: true,
                onSuccess: () => {
                    setCreating(false);
                    showToast('Organisasi baru berhasil dibuat.', 'success');
                },
                onError: () => showToast('Gagal membuat organisasi.', 'error'),
                onFinish: () => setSaving(false),
            });
        }
    }

    function handleDelete(org) {
        if (!confirm(`Hapus organisasi '${org.name}' beserta seluruh data anggotanya?`)) return;

        router.delete(`/organizations/${org.id}`, {
            preserveScroll: true,
            onSuccess: () => showToast(`Organisasi '${org.name}' telah dihapus.`, 'info'),
            onError: () => showToast('Gagal menghapus organisasi.', 'error'),
        });
    }

    function handleAddMember(e) {
        e.preventDefault();
        if (!managingMembersOrg) return;
        setAddingMember(true);

        router.post(`/organizations/${managingMembersOrg.id}/members`, memberForm, {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Anggota berhasil ditambahkan ke organisasi.', 'success');
                setMemberForm({ user_id: availableUsers[0]?.id || '', role: 'member' });
            },
            onError: (err) => showToast(Object.values(err)[0] || 'Gagal menambahkan anggota.', 'error'),
            onFinish: () => setAddingMember(false),
        });
    }

    function handleRemoveMember(orgId, userId, userName) {
        if (!confirm(`Keluarkan ${userName} dari organisasi?`)) return;

        router.delete(`/organizations/${orgId}/members/${userId}`, {
            preserveScroll: true,
            onSuccess: () => showToast(`${userName} telah dikeluarkan dari organisasi.`, 'info'),
            onError: (err) => showToast(Object.values(err)[0] || 'Gagal mengeluarkan anggota.', 'error'),
        });
    }

    const columns = [
        {
            key: 'name',
            label: 'Organisasi & Divisi',
            sortable: true,
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/10 dark:bg-violet-500/20 font-bold text-violet-700 dark:text-violet-300">
                        {row.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                        <span className="block font-semibold text-slate-900 dark:text-slate-100">{row.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/{row.slug}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'owner',
            label: 'Pemilik (Owner)',
            render: (_, row) => (
                <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.owner?.name || '-'}</span>
                    <span className="block text-[11px] text-slate-400">{row.owner?.email || ''}</span>
                </div>
            ),
        },
        {
            key: 'members',
            label: 'Anggota Tim',
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {row.members?.length || 0} / {row.max_members}
                    </span>
                    <button
                        type="button"
                        onClick={() => setManagingMembersOrg(row)}
                        className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                    >
                        Kelola
                    </button>
                </div>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            sortable: true,
            render: (_, row) => (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    row.is_active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${row.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
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
                        onClick={() => openEdit(row)}
                        className="btn btn-xs btn-ghost text-slate-600 dark:text-slate-300"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="btn btn-xs btn-ghost text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                        Hapus
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout
            eyebrow="Identitas & Akses"
            title="Manajemen Organisasi & Tim"
            desc="Kelola struktur multi-tenant, kuota keanggotaan departemen, dan delegasi tim kerja dalam organisasi."
            actions={
                <SolidButton onClick={openCreate} tone="amber">
                    Tambah Organisasi
                </SolidButton>
            }
        >
            <Head title="Manajemen Organisasi & Tim" />

            {/* Statistik Organisasi */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Organisasi"
                    value={stats.total}
                    hint="Entitas terdaftar"
                />
                <StatCard
                    label="Organisasi Aktif"
                    value={stats.active}
                    hint="Operasional normal"
                />
                <StatCard
                    label="Total Keanggotaan"
                    value={stats.total_members}
                    hint="Pengguna dalam tim"
                />
                <StatCard
                    label="Organisasi Saya"
                    value={stats.my_orgs}
                    hint="Diikuti akun ini"
                />
            </div>

            {/* Tabel Organisasi */}
            <DataTable
                columns={columns}
                data={organizations.data}
                pagination={organizations}
                searchRoute="/organizations"
                searchPlaceholder="Cari organisasi berdasarkan nama atau slug..."
                defaultSort="created_at"
                defaultDirection="desc"
                filters={[
                    {
                        key: 'is_active',
                        label: 'Status Operasional',
                        value: filters.is_active ?? '',
                        options: [
                            { value: '1', label: 'Aktif Saja' },
                            { value: '0', label: 'Nonaktif Saja' },
                        ],
                    },
                ]}
            />

            {/* Modal Tambah / Edit Organisasi */}
            {(creating || editingOrg) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                {editingOrg ? 'Sunting Informasi Organisasi' : 'Buat Organisasi Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => { setCreating(false); setEditingOrg(null); }}
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
                                    Nama Organisasi / Perusahaan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Divisi Keamanan Siber"
                                    className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Slug Identifikasi (URL)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        placeholder="otomatis-dari-nama"
                                        className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Kuota Maksimal Anggota
                                    </label>
                                    <input
                                        type="number"
                                        min={2}
                                        max={1000}
                                        required
                                        value={form.max_members}
                                        onChange={(e) => setForm({ ...form, max_members: parseInt(e.target.value) || 50 })}
                                        className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Deskripsi Singkat
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Tujuan, cakupan kerja, atau keterangan divisi..."
                                    className="textarea textarea-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="org-active"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    className="checkbox checkbox-sm checkbox-primary"
                                />
                                <label htmlFor="org-active" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    Organisasi Aktif dan Terbuka untuk Kolaborasi
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setCreating(false); setEditingOrg(null); }}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-sm btn-brand border-0"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Organisasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Manajemen Anggota Tim */}
            {managingMembersOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    Anggota Tim: {managingMembersOrg.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kapasitas: {managingMembersOrg.members?.length || 0} / {managingMembersOrg.max_members} anggota
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setManagingMembersOrg(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form Tambah Anggota */}
                        <form onSubmit={handleAddMember} className="mt-4 flex flex-wrap items-end gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
                            <div className="flex-1 min-w-[200px]">
                                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Pilih Pengguna
                                </label>
                                <select
                                    value={memberForm.user_id}
                                    onChange={(e) => setMemberForm({ ...memberForm, user_id: e.target.value })}
                                    className="select select-sm select-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                >
                                    {availableUsers.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-32">
                                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Peran Tim
                                </label>
                                <select
                                    value={memberForm.role}
                                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                    className="select select-sm select-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                    <option value="guest">Guest</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={addingMember}
                                className="btn btn-sm btn-brand border-0 shrink-0"
                            >
                                {addingMember ? 'Menambahkan...' : 'Tambah Anggota'}
                            </button>
                        </form>

                        {/* List Anggota Saat Ini */}
                        <div className="mt-4 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                            {managingMembersOrg.members?.map((m) => (
                                <div key={m.id} className="flex items-center justify-between py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
                                            {m.user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{m.user?.name}</p>
                                            <p className="text-[11px] text-slate-400">{m.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                            m.role === 'owner'
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                : m.role === 'admin'
                                                ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300'
                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}>
                                            {m.role}
                                        </span>
                                        {m.role !== 'owner' && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(managingMembersOrg.id, m.user_id, m.user?.name)}
                                                className="btn btn-xs btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                            >
                                                Keluarkan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
