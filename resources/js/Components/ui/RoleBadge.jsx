export default function RoleBadge({ roles }) {
    if (!roles || roles.length === 0) {
        return <span className="badge bg-slate-100 text-slate-600">Tanpa role</span>;
    }

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

