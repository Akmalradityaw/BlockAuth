import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { fire } from '@/Components/feedback/Swal';
import { showLoading, hideLoading } from '@/Components/feedback/LoadingOverlay';

export default function UserBulkActionBar({
    selectedIds = [],
    availableRoles = [],
    onClear = () => {},
}) {
    const [selectedRole, setSelectedRole] = useState(availableRoles[0] || 'Staff');
    const [showRolePicker, setShowRolePicker] = useState(false);

    if (!selectedIds || selectedIds.length === 0) {
        return null;
    }

    async function handleBulkDelete() {
        const { isConfirmed } = await fire({
            title: 'Hapus Pengguna Terpilih',
            text: `Apakah Anda yakin ingin menghapus ${selectedIds.length} pengguna secara permanen? Akun Anda sendiri dan SuperAdmin terakhir tidak akan terhapus.`,
            icon: 'warning',
            confirmText: `Ya, Hapus ${selectedIds.length} Pengguna`,
            showCancelButton: true,
        });

        if (isConfirmed) {
            showLoading('Menghapus data pengguna terpilih...');
            router.post('/users/bulk-delete', { user_ids: selectedIds }, {
                preserveScroll: true,
                onFinish: () => {
                    hideLoading();
                    onClear();
                },
            });
        }
    }

    async function handleBulkRole() {
        showLoading(`Mengubah peran ke ${selectedRole}...`);
        router.post('/users/bulk-role', {
            user_ids: selectedIds,
            role: selectedRole,
        }, {
            preserveScroll: true,
            onFinish: () => {
                hideLoading();
                setShowRolePicker(false);
                onClear();
            },
        });
    }

    async function handleBulkVerify() {
        showLoading('Memverifikasi akun pengguna terpilih...');
        router.post('/users/bulk-verify', { user_ids: selectedIds }, {
            preserveScroll: true,
            onFinish: () => {
                hideLoading();
                onClear();
            },
        });
    }

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-xl border border-slate-700 bg-[#1E1B4B] px-4 py-2.5 text-white shadow-2xl">
            <span className="flex items-center gap-1.5 rounded-full bg-[#F59E0B] px-2.5 py-0.5 text-xs font-bold text-slate-950">
                {selectedIds.length} Terpilih
            </span>

            <div className="h-4 w-px bg-slate-700" />

            {/* Tombol Ubah Role */}
            <div className="relative">
                {showRolePicker ? (
                    <div className="flex items-center gap-1.5">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="select select-bordered select-xs bg-slate-800 text-white border-slate-600"
                        >
                            {availableRoles.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleBulkRole}
                            className="btn btn-xs border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
                        >
                            Terapkan
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowRolePicker(false)}
                            className="btn btn-xs btn-ghost text-slate-400 hover:text-white"
                            title="Tutup pilihan"
                        >
                            Tutup
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowRolePicker(true)}
                        className="btn btn-xs border-0 bg-slate-800 text-white hover:bg-slate-700"
                    >
                        Ubah Role
                    </button>
                )}
            </div>

            {/* Tombol Verifikasi Email */}
            <button
                type="button"
                onClick={handleBulkVerify}
                className="btn btn-xs border-0 bg-slate-800 text-white hover:bg-slate-700"
            >
                Verifikasi Email
            </button>

            {/* Ekspor Terpilih ke Halaman Ekspor Terpadu */}
            <Link
                href={`/export-import?entity=users&mode=export&ids=${selectedIds.join(',')}`}
                className="btn btn-xs border-0 bg-slate-800 text-white hover:bg-slate-700 flex items-center gap-1 font-medium"
                title="Buka pusat ekspor untuk pengguna terpilih"
            >
                <svg className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Ekspor Terpilih</span>
            </Link>

            {/* Tombol Hapus Massal */}
            <button
                type="button"
                onClick={handleBulkDelete}
                className="btn btn-xs border-0 bg-rose-600 text-white hover:bg-rose-700 font-semibold"
            >
                Hapus
            </button>

            <div className="h-4 w-px bg-slate-700" />

            {/* Batal Pilih */}
            <button
                type="button"
                onClick={onClear}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
                Batal
            </button>
        </div>
    );
}

