import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { fire } from '@/Components/feedback/Swal';
import { hideLoading, showLoading } from '@/Components/feedback/LoadingOverlay';
import StatCard from '@/Components/ui/StatCard';
import Pagination from '@/Components/ui/Pagination';
import { can } from '@/lib/can';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import UserFilterBar from './Partials/UserFilterBar';
import UserTable from './Partials/UserTable';
import UserBulkActionBar from './Partials/UserBulkActionBar';
import ImportUserModal from './Partials/ImportUserModal';
import CreateUserModal from './Partials/CreateUserModal';
import EditUserModal from './Partials/EditUserModal';

export default function UserIndex({ users, stats, filters = {}, availableRoles = [] }) {
    const { auth } = usePage().props;
    const perms = auth?.permissions || [];
    const canCreate = can(perms, 'users:create');
    const canUpdate = can(perms, 'users:update');
    const canDelete = can(perms, 'users:delete');
    const canManage = can(perms, 'roles:manage');

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const isSuperAdmin = Boolean(auth?.roles?.includes('SuperAdmin'));

    const {
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        clearSelection,
    } = useBulkSelection(filters);

    function handleOpenEdit(u) {
        setSelectedUser(u);
        setEditModalOpen(true);
    }

    async function handleImpersonate(u) {
        const { isConfirmed } = await fire({
            title: 'Masuk Sebagai Pengguna',
            text: `Mulai sesi impersonasi sebagai ${u.name} (${u.email})? Anda akan melihat antarmuka dari sudut pandang akun ini. Seluruh aksi sensitif akun target akan dibatasi.`,
            icon: 'info',
            confirmText: 'Ya, Masuk Sebagai Pengguna',
            showCancelButton: true,
        });

        if (isConfirmed) {
            showLoading('Memulai sesi impersonasi...');
            router.post(`/users/${u.id}/impersonate`, {}, {
                onFinish: () => hideLoading(),
            });
        }
    }

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
            desc="Kelola data akun, peran akses, status verifikasi, dan ekspor data pengguna."
            actions={
                <div className="flex items-center gap-2">
                    {canManage && (
                        <Link href="/roles/permissions" className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]">
                            Kelola Akses
                        </Link>
                    )}
                    <Link href="/dashboard" className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-50">
                        Kembali ke dashboard
                    </Link>
                </div>
            }
        >
            <Head title="Data Pengguna" />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Pengguna" value={stats.total} />
                <StatCard label="Terverifikasi" value={stats.verified} />
                <StatCard label="SuperAdmin" value={stats.admins} />
            </div>

            <UserFilterBar
                filters={filters}
                availableRoles={availableRoles}
                canCreate={canCreate}
                onOpenCreate={() => setCreateModalOpen(true)}
                onOpenImport={() => setImportModalOpen(true)}
            />

            <UserTable
                users={users.data}
                currentUserId={auth?.user?.id}
                canUpdate={canUpdate}
                canDelete={canDelete}
                isSuperAdmin={isSuperAdmin}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                onEdit={handleOpenEdit}
                onDelete={askDelete}
                onImpersonate={handleImpersonate}
            />

            <div className="mt-4">
                <Pagination pagination={users} label="pengguna" />
            </div>

            <UserBulkActionBar
                selectedIds={selectedIds}
                availableRoles={availableRoles}
                onClear={clearSelection}
            />

            <ImportUserModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
            />

            <CreateUserModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                availableRoles={availableRoles}
            />

            <EditUserModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                availableRoles={availableRoles}
            />
        </AppLayout>
    );
}
