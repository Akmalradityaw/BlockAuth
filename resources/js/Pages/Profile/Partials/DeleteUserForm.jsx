import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import FormInput from '@/Components/ui/FormInput';
import SolidButton from '@/Components/ui/SolidButton';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    function confirmUserDeletion() {
        clearErrors();
        reset();
        setConfirmingUserDeletion(true);
    }

    function deleteUser(e) {
        e.preventDefault();

        destroy('/profile', {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => {},
            onFinish: () => reset(),
        });
    }

    function closeModal() {
        setConfirmingUserDeletion(false);
        reset();
        clearErrors();
    }

    return (
        <section className="card-shell border-red-200 p-4 sm:p-6">
            <div className="border-b border-red-100 pb-4">
                <div className="flex items-center gap-2">
                    <span className="badge border-0 bg-red-100 text-xs font-bold text-red-700">
                        Zona Bahaya
                    </span>
                    <h2 className="type-h2 font-bold text-red-700">Hapus Akun Permanen</h2>
                </div>
                <p className="type-small mt-1 text-[#334155]">
                    Setelah akun Anda dihapus, seluruh data, akses, dan riwayat yang berkaitan dengan akun ini akan dimusnahkan secara permanen.
                </p>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                    Tindakan ini tidak dapat dibatalkan. Pastikan Anda telah mencadangkan data penting sebelum melanjutkan.
                </p>
                <button
                    type="button"
                    onClick={confirmUserDeletion}
                    className="btn btn-sm shrink-0 border-0 bg-red-600 font-semibold text-white hover:bg-red-700"
                >
                    Hapus Akun Saya
                </button>
            </div>

            {confirmingUserDeletion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#1E1B4B]">
                                    Konfirmasi Penghapusan Akun
                                </h3>
                                <p className="text-xs text-[#334155]">
                                    Masukkan kata sandi Anda untuk melanjutkan.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={deleteUser} className="mt-4 space-y-4">
                            <p className="text-sm text-[#334155]">
                                Apakah Anda yakin ingin menghapus akun ini secara permanen? Silakan masukkan kata sandi akun untuk verifikasi keamanan.
                            </p>

                            <FormInput
                                id="delete_account_password"
                                type="password"
                                name="password"
                                label="Kata Sandi"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan kata sandi akun"
                                error={errors.password}
                                required
                                autoFocus
                            />

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                    disabled={processing}
                                >
                                    Batal
                                </button>
                                <SolidButton
                                    type="submit"
                                    variant="danger"
                                    size="sm"
                                    loading={processing}
                                    className="!bg-red-600 !text-white hover:!bg-red-700"
                                >
                                    Hapus Akun Saya
                                </SolidButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

