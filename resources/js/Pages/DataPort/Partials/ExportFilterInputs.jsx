export default function ExportFilterInputs({
    entity,
    availableRoles = [],
    actionOptions = [],
    userRole,
    setUserRole,
    userStatus,
    setUserStatus,
    userSearch,
    setUserSearch,
    auditAction,
    setAuditAction,
    auditSearch,
    setAuditSearch,
}) {
    return (
        <div className="card-shell p-6">
            <h3 className="text-base font-bold text-[#1E1B4B]">Saring Kriteria Data</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {entity === 'users' ? (
                    <>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Peran Pengguna</label>
                            <select
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                                className="select select-bordered select-sm w-full bg-white text-[#1E1B4B]"
                            >
                                <option value="">Semua Peran</option>
                                {availableRoles.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Verifikasi</label>
                            <select
                                value={userStatus}
                                onChange={(e) => setUserStatus(e.target.value)}
                                className="select select-bordered select-sm w-full bg-white text-[#1E1B4B]"
                            >
                                <option value="">Semua Status</option>
                                <option value="verified">Terverifikasi</option>
                                <option value="unverified">Belum Verifikasi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Cari Kata Kunci</label>
                            <input
                                type="text"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Nama atau email..."
                                className="input input-bordered input-sm w-full bg-white text-[#1E1B4B]"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Aksi Log</label>
                            <select
                                value={auditAction}
                                onChange={(e) => setAuditAction(e.target.value)}
                                className="select select-bordered select-sm w-full bg-white text-[#1E1B4B]"
                            >
                                <option value="">Semua Tipe Aksi</option>
                                {actionOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Cari Kata Kunci</label>
                            <input
                                type="text"
                                value={auditSearch}
                                onChange={(e) => setAuditSearch(e.target.value)}
                                placeholder="Deskripsi, IP, nama aktor..."
                                className="input input-bordered input-sm w-full bg-white text-[#1E1B4B]"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

