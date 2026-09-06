import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { RoleBadge, StatCard } from '@/Components/Ui';

function initials(name) {
    return (name || '?').charAt(0).toUpperCase();
}

export default function Dashboard({ stats, recentUsers = [], isSuperAdmin }) {
    return (
        <AppLayout
            eyebrow="Ringkasan"
            title="Dashboard"
            desc="Statistik pengguna dan aktivitas terbaru. Tata letak 1 kolom di HP dan 3 kolom di desktop."
            actions={
                <>
                    <Link href="/users" className="btn btn-sm border-0 bg-[#F59E0B] text-[#1E1B4B]">
                        Data Pengguna
                    </Link>
                    <Link href="/profile" className="btn btn-sm btn-brand border-0">
                        Edit Profil
                    </Link>
                </>
            }
        >
            <Head title="Dashboard" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard label="Total pengguna" value={stats.total} note="Termasuk admin dan user biasa" />
                <StatCard label="Terverifikasi" value={stats.verified} note="Email sudah dikonfirmasi" />
                <StatCard label="SuperAdmin" value={stats.admins} note="Akses penuh ke data pengguna" />
            </div>
            <section className="card-shell mt-6 p-4 sm:p-6">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="type-h2 text-[#1E1B4B]">Pengguna terbaru</h2>
                    {isSuperAdmin && (
                        <Link href="/users" className="type-small font-semibold text-[#6D28D9]">
                            Buka semua data
                        </Link>
                    )}
                </div>
                <ul className="divide-y divide-slate-200">
                    {recentUsers.map((u) => (
                        <li key={u.id} className="flex items-center gap-3 py-3">
                            {u.avatar_url ? (
                                <img src={u.avatar_url} alt={u.name} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                            ) : (
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E1B4B] font-bold text-white">
                                    {initials(u.name)}
                                </span>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-[#1E1B4B] sm:text-base">{u.name}</p>
                                <p className="type-small truncate text-[#334155]">{u.email}</p>
                                <div className="mt-1 sm:hidden">
                                    <RoleBadge roles={u.roles} />
                                </div>
                            </div>
                            <div className="hidden shrink-0 sm:block">
                                <RoleBadge roles={u.roles} />
                            </div>
                            <span className="type-small hidden shrink-0 text-[#334155] md:block">{u.joined}</span>
                        </li>
                    ))}
                </ul>
                {recentUsers.length === 0 && (
                    <p className="type-small py-6 text-center text-[#334155]">Belum ada data pengguna.</p>
                )}
            </section>
        </AppLayout>
    );
}
