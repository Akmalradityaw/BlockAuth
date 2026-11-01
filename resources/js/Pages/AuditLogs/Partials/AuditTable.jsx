import { initials } from '@/lib/ui';

function ActionBadge({ action }) {
    let color = 'bg-slate-100 text-slate-700 border-slate-200';

    if (action.startsWith('auth:login')) {
        color = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    } else if (action.startsWith('auth:failed') || action.startsWith('auth:2fa_failed')) {
        color = 'bg-rose-100 text-rose-800 border-rose-200';
    } else if (action.startsWith('auth:logout')) {
        color = 'bg-slate-100 text-slate-700 border-slate-200';
    } else if (action.startsWith('settings:')) {
        color = 'bg-purple-100 text-purple-800 border-purple-200';
    } else if (action.startsWith('roles:')) {
        color = 'bg-indigo-100 text-indigo-800 border-indigo-200';
    } else if (action.startsWith('profile:')) {
        color = 'bg-sky-100 text-sky-800 border-sky-200';
    } else if (action.startsWith('session:')) {
        color = 'bg-amber-100 text-amber-800 border-amber-200';
    } else if (action.startsWith('users:delete') || action.startsWith('account:delete')) {
        color = 'bg-red-100 text-red-800 border-red-200';
    } else if (action.startsWith('users:')) {
        color = 'bg-blue-100 text-blue-800 border-blue-200';
    }

    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${color}`}>
            {action}
        </span>
    );
}

export default function AuditTable({ logs = [], onInspect }) {
    if (logs.length === 0) {
        return (
            <div className="card-shell mt-6 p-8 text-center">
                <p className="font-semibold text-[#1E1B4B]">Belum ada riwayat aktivitas yang tercatat.</p>
                <p className="type-small mt-1 text-[#334155]">
                    Log aktivitas akan muncul secara otomatis saat terjadi aksi pengguna atau sistem.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Tampilan Mobile Card */}
            <div className="mt-6 grid gap-3 md:hidden">
                {logs.map((log) => (
                    <article key={log.id} className="card-shell space-y-3 p-4">
                        <div className="flex items-center justify-between gap-2">
                            <ActionBadge action={log.action} />
                            <span className="text-xs text-slate-500">{log.created_at_human}</span>
                        </div>

                        <p className="text-sm font-semibold text-[#1E1B4B]">{log.description}</p>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-[#334155]">
                            <span className="font-medium">
                                {log.user ? log.user.name : 'Sistem / Anonim'}
                            </span>
                            <span className="font-mono">{log.ip_address}</span>
                        </div>

                        {log.properties && (
                            <button
                                type="button"
                                onClick={() => onInspect(log)}
                                className="btn btn-xs w-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            >
                                Lihat Metadata
                            </button>
                        )}
                    </article>
                ))}
            </div>

            {/* Tampilan Desktop Table */}
            <div className="table-shell mt-6 hidden md:block">
                <table className="table">
                    <thead>
                        <tr className="bg-[#EEF2FF] text-[#1E1B4B]">
                            <th>Waktu</th>
                            <th>Pengguna</th>
                            <th>Aksi</th>
                            <th>Deskripsi Aktivitas</th>
                            <th>Perangkat & IP</th>
                            <th className="text-right">Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50">
                                <td className="whitespace-nowrap text-xs text-slate-600">
                                    <span className="font-medium">{log.created_at}</span>
                                    <span className="block text-[11px] text-slate-400">{log.created_at_human}</span>
                                </td>
                                <td>
                                    {log.user ? (
                                        <div className="flex items-center gap-2">
                                            {log.user.avatar_url ? (
                                                <img src={log.user.avatar_url} alt="" className="h-7 w-7 rounded-lg object-cover" />
                                            ) : (
                                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E1B4B] text-xs font-bold text-white">
                                                    {initials(log.user.name)}
                                                </span>
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold text-[#1E1B4B]">{log.user.name}</p>
                                                <p className="truncate text-[11px] text-slate-500">{log.user.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs italic text-slate-400">Sistem / Tamu</span>
                                    )}
                                </td>
                                <td>
                                    <ActionBadge action={log.action} />
                                </td>
                                <td className="max-w-md text-xs font-medium text-[#1E1B4B]">
                                    {log.description}
                                </td>
                                <td className="whitespace-nowrap text-xs text-[#334155]">
                                    <span>{log.browser} ({log.platform})</span>
                                    <span className="block font-mono text-[11px] text-slate-500">{log.ip_address}</span>
                                </td>
                                <td className="text-right">
                                    {log.properties ? (
                                        <button
                                            type="button"
                                            onClick={() => onInspect(log)}
                                            className="btn btn-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                        >
                                            Detail
                                        </button>
                                    ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

