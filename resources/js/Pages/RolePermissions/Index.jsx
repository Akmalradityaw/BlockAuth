import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import SolidButton from '@/Components/forms/SolidButton';
import { hideLoading, showLoading } from '@/Components/feedback/LoadingOverlay';

const RESOURCE_LABELS = { users: 'Pengguna', settings: 'Pengaturan', roles: 'Akses' };

function groupsOf(allPermissions) {
    const groups = {};
    allPermissions.forEach((perm) => {
        const [res, act] = perm.split(':');
        if (!res || !act) return;
        (groups[res] ||= []).push(act);
    });
    return groups;
}

export default function RolePermissionIndex({ roles, allPermissions }) {
    const groups = groupsOf(allPermissions);
    const { data, setData, put, processing } = useForm({
        matrix: Object.fromEntries(roles.map((r) => [r.id, r.permissions])),
    });

    function toggle(roleId, perm) {
        const current = data.matrix[roleId] || [];
        const next = current.includes(perm)
            ? current.filter((p) => p !== perm)
            : [...current, perm];
        setData('matrix', { ...data.matrix, [roleId]: next });
    }

    function submit(e) {
        e.preventDefault();
        showLoading('Menyimpan matriks...');
        // Auto refresh: respons PUT me-reload props sehingga tabel sinkron sendiri.
        put('/roles/permissions', { onFinish: () => hideLoading() });
    }

    return (
        <AppLayout
            eyebrow="Otorisasi"
            title="Matriks Permission"
            desc="Centang aksi per resource untuk tiap role. Hanya SuperAdmin yang membuka halaman ini."
            actions={
                <Link
                    href="/settings"
                    className="btn btn-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1B4B] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                    Pengaturan
                </Link>
            }
        >
            <Head title="Matriks Permission" />
            {/* Toast global dari AppLayout */}
            <form onSubmit={submit} className="flex flex-col gap-4">
                {Object.entries(groups).map(([res, acts]) => (
                    <section key={res} className="card-shell p-4 sm:p-6">
                        <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">{RESOURCE_LABELS[res] || res}</h2>
                        <div className="table-shell mt-3 overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="bg-[#EEF2FF] text-[#1E1B4B] dark:bg-slate-800 dark:text-slate-200">
                                        <th>Role</th>
                                        {acts.map((act) => <th key={act} className="text-center">{act}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role) => (
                                        <tr key={role.id} className="dark:border-slate-800">
                                            <td>
                                                <p className="font-semibold text-[#1E1B4B] dark:text-slate-100">
                                                    {role.display_name}
                                                    {role.is_system && (
                                                        <span className="badge badge-role-user ml-2 border-0 text-xs">Sistem</span>
                                                    )}
                                                </p>
                                                {role.description && (
                                                    <p className="type-small text-[#334155] dark:text-slate-400">{role.description}</p>
                                                )}
                                            </td>
                                            {acts.map((act) => {
                                                const perm = `${res}:${act}`;
                                                const locked = role.is_system && perm === 'roles:manage';
                                                return (
                                                    <td key={perm} className="text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox border-slate-400 dark:border-slate-600 disabled:opacity-60"
                                                            checked={(data.matrix[role.id] || []).includes(perm)}
                                                            disabled={locked}
                                                            onChange={() => toggle(role.id, perm)}
                                                            aria-label={`${role.display_name} ${perm}`}
                                                            title={locked ? 'Kunci sistem, tidak bisa dicabut dari UI' : undefined}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))}
                <div className="max-w-xs">
                    <SolidButton processing={processing}>Simpan Matriks</SolidButton>
                </div>
            </form>
        </AppLayout>
    );
}
