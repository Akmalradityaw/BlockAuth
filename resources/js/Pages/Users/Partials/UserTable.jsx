import RoleBadge from '@/Components/ui/RoleBadge';
import { initials } from '@/lib/ui';

export default function UserTable({
    users = [],
    currentUserId,
    canUpdate,
    canDelete,
    isSuperAdmin = false,
    selectedIds = [],
    onToggleSelect = () => {},
    onToggleSelectAll = () => {},
    onEdit,
    onDelete,
    onImpersonate,
}) {
    const selectableUserIds = users.filter((u) => u.id !== currentUserId).map((u) => u.id);
    const isAllSelected = selectableUserIds.length > 0 && selectableUserIds.every((id) => selectedIds.includes(id));
    if (users.length === 0) {
        return (
            <div className="card-shell mt-6 p-8 text-center">
                <p className="font-semibold text-[#1E1B4B]">Tidak ada data pengguna yang sesuai.</p>
                <p className="type-small mt-1 text-[#334155]">
                    Coba ubah kata kunci pencarian atau bersihkan filter yang aktif.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Tampilan Kartu di Layar Mobile */}
            <div className="mt-6 grid gap-3 md:hidden">
                {users.map((u) => {
                    const isTargetSelf = u.id === currentUserId;
                    const isTargetSuperAdmin = u.roles?.includes('SuperAdmin');
                    const canImpersonateThis = isSuperAdmin && !isTargetSelf && !isTargetSuperAdmin;

                    return (
                        <article key={u.id} className="card-shell flex items-start gap-3 p-4">
                            {u.avatar_url ? (
                                <img src={u.avatar_url} alt={u.name} className="h-12 w-12 rounded-xl object-cover" />
                            ) : (
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#6D28D9] text-lg font-bold text-white">
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
                                {u.bio && <p className="type-small mt-2 line-clamp-2 text-[#334155]">{u.bio}</p>}
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {canImpersonateThis && onImpersonate && (
                                        <button
                                            type="button"
                                            onClick={() => onImpersonate(u)}
                                            className="btn btn-xs border border-purple-200 bg-purple-50 text-[#6D28D9] hover:bg-purple-100 font-semibold"
                                        >
                                            Login As
                                        </button>
                                    )}
                                    {canUpdate && (
                                        <button
                                            type="button"
                                            onClick={() => onEdit(u)}
                                            className="btn btn-xs border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-100"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {canDelete && !isTargetSelf && (
                                        <button
                                            type="button"
                                            onClick={() => onDelete(u)}
                                            className="btn btn-xs border-0 bg-red-800 text-white hover:bg-red-900"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* Tampilan Tabel di Layar Desktop */}
            <div className="table-shell mt-6 hidden md:block">
                <table className="table">
                    <thead>
                        <tr className="bg-[#EEF2FF] text-[#1E1B4B]">
                            <th className="w-10">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-xs border-slate-400"
                                    checked={isAllSelected}
                                    onChange={() => onToggleSelectAll(selectableUserIds)}
                                    title="Pilih Semua"
                                />
                            </th>
                            <th>Pengguna</th>
                            <th>Bio</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Bergabung</th>
                            {(canUpdate || canDelete || isSuperAdmin) && <th>Aksi</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const isTargetSelf = u.id === currentUserId;
                            const isTargetSuperAdmin = u.roles?.includes('SuperAdmin');
                            const canImpersonateThis = isSuperAdmin && !isTargetSelf && !isTargetSuperAdmin;
                            const isRowChecked = selectedIds.includes(u.id);

                            return (
                                <tr key={u.id} className={isRowChecked ? 'bg-indigo-50/60' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-xs border-slate-400"
                                            checked={isRowChecked}
                                            disabled={isTargetSelf}
                                            onChange={() => onToggleSelect(u.id)}
                                            title={isTargetSelf ? 'Tidak bisa memilih akun Anda sendiri' : 'Pilih baris ini'}
                                        />
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt={u.name} className="h-10 w-10 rounded-xl object-cover" />
                                            ) : (
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E1B4B] font-bold text-white">
                                                    {initials(u.name)}
                                                </span>
                                            )}
                                            <div className="min-w-0">
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
                                    {(canUpdate || canDelete || isSuperAdmin) && (
                                        <td>
                                            <div className="flex items-center gap-2">
                                                {canImpersonateThis && onImpersonate && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onImpersonate(u)}
                                                        className="btn btn-xs border border-purple-200 bg-purple-50 text-[#6D28D9] hover:bg-purple-100 font-semibold"
                                                    >
                                                        Login As
                                                    </button>
                                                )}
                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onEdit(u)}
                                                        className="btn btn-xs border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-100"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {canDelete && !isTargetSelf ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(u)}
                                                        className="btn btn-xs border-0 bg-red-800 text-white hover:bg-red-900"
                                                    >
                                                        Hapus
                                                    </button>
                                                ) : (
                                                    isTargetSelf && <span className="type-small text-slate-400">Anda</span>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
