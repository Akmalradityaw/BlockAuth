import StatCard from '@/Components/ui/StatCard';

export default function AuditStats({ stats }) {
    if (!stats) return null;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Log Aktivitas" value={stats.total} />
            <StatCard label="Login Berhasil Hari Ini" value={stats.logins_today} />
            <StatCard label="Login Gagal Hari Ini" value={stats.failed_today} />
            <StatCard label="Perubahan Sistem" value={stats.system_changes} />
        </div>
    );
}

