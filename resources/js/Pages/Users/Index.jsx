import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { fire } from '@/Components/feedback/Swal';
import { hideLoading, showLoading } from '@/Components/feedback/LoadingOverlay';
import { RoleBadge, StatCard } from '@/Components/data/Ui';
import { can } from '@/lib/can';
import { initials } from '@/lib/ui';

export default function UserIndex({ users, stats }) {
    const { auth } = usePage().props;
    const perms = auth?.permissions || [];
    const canDelete = can(perms, 'users:delete');
    const canManage = can(perms, 'roles:manage');

    async function askDelete(u) {
        const { isConfirmed } = await fire({
            title: 'Hapus pengguna',
            text: `Hapus ${u.name} (${u.email}) secara permanen?`,
            icon: 'warning',
            confirmText: 'Ya, hapus',
            showCancelButton: true,
        });
        if (isConfirmed) {
            showLoading('Menghapus pengguna...');
            // Auto refresh: respons DELETE me-reload daftar dari server.
            router.delete(`/users/${u.id}`, {
                preserveScroll: true,
                onFinish: () => hideLoading(),
            });
        }
    }

    return (
        <AppLayout
            eyebrow="Direktori"
            title="Data Pengguna"
            desc="Daftar akun terdaftar dengan role, status verifikasi, dan tanggal bergabung."
            actions={
                <>
                    {canManage && (
                        <Link href="/roles/permissions" className="btn btn-sm border-0 bg-[#6D28D9] text-white">
                            Kelola Akses
                        </Link>
                    )}
                    <Link href="/dashboard" className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B]">
                        Kembali ke dashboard
                    </Link>
                </>
            }
        >
            <Head title="Data Pengguna" />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total" value={stats.total} />
                <StatCard label="Terverifikasi" value={stats.verified} />
                <StatCard label="SuperAdmin" value={stats.admins} />
            </div>

            <div className="mt-6 grid gap-3 md:hidden">
                {users.data.map((u) => (
                    <article key={u.id} className="card-shell flex items-center gap-3 p-4">
                        {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="h-12 w-12 rounded-xl object-cover" />
                        ) : (
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6D28D9] text-lg font-bold text-white">
                                {initials(u.name)}
                            </span>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-[#1E1B4B]">{u.name}</p>
                            <p className="type-small truncate text-[#334155]">{u.email}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <RoleBadge roles={u.roles} />
                                <span className={`badge border-0 text-xs ${u.verified ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                    {u.verified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                            {u.bio && <p className="type-small mt-1 line-clamp-2 text-[#334155]">{u.bio}</p>}
                            {canDelete && u.id !== auth.user.id && (
                                <button
                                    type="button"
                                    onClick={() => askDelete(u)}
                                    className="btn btn-xs mt-2 border-0 bg-red-800 text-white"
                                >
                                    Hapus
                                </button>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            <div className="table-shell mt-6 hidden md:block">
                <table className="table">
                    <thead>
                        <tr className="bg-[#EEF2FF] text-[#1E1B4B]">
                            <th>Pengguna</th>
                            <th>Bio</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Bergabung</th>
                            {canDelete && <th>Aksi</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((u) => (
                            <tr key={u.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        {u.avatar_url ? (
                                            <img src={u.avatar_url} alt={u.name} className="h-10 w-10 rounded-xl object-cover" />
                                        ) : (
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E1B4B] font-bold text-white">
                                                {initials(u.name)}
                                            </span>
                                        )}
                                        <div>
                                            <p className="font-semibold text-[#1E1B4B]">{u.name}</p>
                                            <p className="type-small text-[#334155]">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="type-small max-w-xs truncate text-[#334155]">{u.bio || '-'}</td>
                                <td>
                                    <RoleBadge roles={u.roles} />
                                </td>
                                <td>
                                    <span className={`badge border-0 text-xs ${u.verified ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {u.verified ? 'Verified' : 'Unverified'}
                                    </span>
                                </td>
                                <td className="type-small text-[#334155]">{u.joined}</td>
                                {canDelete && (
                                    <td>
                                        {u.id !== auth.user.id ? (
                                            <button
                                                type="button"
                                                onClick={() => askDelete(u)}
                                                className="btn btn-xs border-0 bg-red-800 text-white"
                                            >
                                                Hapus
                                            </button>
                                        ) : (
                                            <span className="type-small text-[#334155]">Anda</span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.data.length === 0 && (
                <p className="type-small card-shell mt-6 p-6 text-center text-[#334155]">Belum ada pengguna terdaftar.</p>
            )}

            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="type-small text-center text-[#334155] sm:text-left">
                    {users.from && users.to
                        ? `Menampilkan ${users.from} sampai ${users.to} dari ${users.total} pengguna`
                        : `Total ${users.total} pengguna`}
                </p>
                <div className="join flex-wrap justify-center">
                    {users.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            preserveScroll
                            className={`join-item btn btn-sm ${link.active ? 'border-0 bg-[#6D28D9] text-white' : 'border-slate-300 bg-white text-[#1E1B4B]'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
