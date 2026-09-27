export function RoleBadge({ roles }) {
    if (!roles || roles.length === 0) return <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Tanpa role</span>;
    return (
        <span className="flex flex-wrap gap-1">
            {roles.map((role) => (
                <span
                    key={role}
                    className={`badge border-0 text-xs font-semibold ${
                        role === 'SuperAdmin' ? 'badge-role-superadmin' : 'badge-role-user'
                    }`}
                >
                    {role}
                </span>
            ))}
        </span>
    );
}

export function SectionTitle({ eyebrow, title, desc }) {
    return (
        <div className="mb-4">
            {eyebrow && <p className="type-caption text-[#6D28D9] dark:text-violet-400">{eyebrow}</p>}
            <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">{title}</h2>
            {desc && <p className="type-small mt-1 text-[#334155] dark:text-slate-400">{desc}</p>}
        </div>
    );
}

export function StatCard({ label, value, note }) {
    return (
        <div className="card-shell p-4 sm:p-5">
            <p className="type-caption text-[#334155] dark:text-slate-400">{label}</p>
            <p className="type-h1 text-[#1E1B4B] dark:text-slate-100">{value}</p>
            {note && <p className="type-small mt-1 text-[#334155] dark:text-slate-400">{note}</p>}
        </div>
    );
}
