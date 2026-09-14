export function RoleBadge({ roles }) {
    if (!roles || roles.length === 0) return <span className="badge bg-slate-100 text-slate-600">Tanpa role</span>;
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
            {eyebrow && <p className="type-caption text-[#6D28D9]">{eyebrow}</p>}
            <h2 className="type-h2 text-[#1E1B4B]">{title}</h2>
            {desc && <p className="type-small mt-1 text-[#334155]">{desc}</p>}
        </div>
    );
}

export function StatCard({ label, value, note }) {
    return (
        <div className="card-shell p-4 sm:p-5">
            <p className="type-caption text-[#334155]">{label}</p>
            <p className="type-h1 text-[#1E1B4B]">{value}</p>
            {note && <p className="type-small mt-1 text-[#334155]">{note}</p>}
        </div>
    );
}
