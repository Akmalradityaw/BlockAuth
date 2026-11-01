import { can } from '@/lib/can';

export const NAV_ITEMS = [
    {
        type: 'single',
        label: 'Dashboard',
        href: '/dashboard',
        mark: 'D',
    },
    {
        type: 'group',
        label: 'Kelola',
        children: [
            {
                label: 'Pengguna',
                href: '/users',
                mark: 'P',
                permission: 'users:read',
                feature: 'users',
            },
            {
                label: 'Matriks Akses',
                href: '/roles/permissions',
                mark: 'A',
                permission: 'roles:manage',
                feature: 'roles',
            },
            {
                label: 'Log Audit',
                href: '/audit-logs',
                mark: 'L',
                permission: 'audit_logs:read',
                feature: 'audit_logs',
            },
            {
                label: 'Ekspor & Impor',
                href: '/export-import',
                mark: 'E',
                permission: 'users:read',
            },
        ],
    },
    {
        type: 'single',
        label: 'Pengaturan',
        href: '/settings',
        mark: 'S',
        permission: 'settings:read',
    },
];

export function getVisibleNavItems(perms = [], features = {}, isSuperAdmin = false) {
    return NAV_ITEMS.map((item) => {
        if (item.type === 'single') {
            const hasPerm = !item.permission || can(perms, item.permission);
            const hasFeature = !item.feature || (features[item.feature] ?? true);
            return (hasPerm && hasFeature) ? item : null;
        }

        if (item.type === 'group') {
            const visibleChildren = (item.children || []).filter((child) => {
                const hasPerm = !child.permission || can(perms, child.permission) || (isSuperAdmin && child.feature === 'audit_logs');
                const hasFeature = !child.feature || (features[child.feature] ?? true);
                return hasPerm && hasFeature;
            });

            if (visibleChildren.length === 0) return null;

            return {
                ...item,
                children: visibleChildren,
            };
        }

        return null;
    }).filter(Boolean);
}

