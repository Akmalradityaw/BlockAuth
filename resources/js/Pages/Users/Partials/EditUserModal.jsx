import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import BaseModal from '@/Components/ui/BaseModal';
import FormInput from '@/Components/ui/FormInput';
import SelectInput from '@/Components/ui/SelectInput';
import SolidButton from '@/Components/ui/SolidButton';

export default function EditUserModal({ isOpen, onClose, user, availableRoles = [] }) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        role: '',
        password: '',
        bio: '',
        verified: false,
    });

    useEffect(() => {
        if (user && isOpen) {
            setData({
                name: user.name || '',
                email: user.email || '',
                role: user.roles?.[0] || availableRoles[0] || 'Staff',
                password: '',
                bio: user.bio || '',
                verified: Boolean(user.verified),
            });
            clearErrors();
        }
    }, [user, isOpen]);

    if (!user) return null;

    function handleSubmit(e) {
        e.preventDefault();
        put(`/users/${user.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    const roleOptions = availableRoles.map((r) => ({ value: r, label: r }));

    return (
        <BaseModal
            open={isOpen}
            onClose={onClose}
            title={
                <div>
                    <h3 className="type-h2 font-bold text-[#1E1B4B]">Edit Data Pengguna</h3>
                    <p className="type-small text-[#334155]">{user.email}</p>
                </div>
            }
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm border border-slate-300 bg-white text-[#334155] hover:bg-slate-100"
                    >
                        Batal
                    </button>
                    <SolidButton
                        type="submit"
                        form="edit-user-form"
                        processing={processing}
                        fullWidth={false}
                        variant="primary"
                        className="btn-sm"
                    >
                        Simpan Perubahan
                    </SolidButton>
                </>
            }
        >
            <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Nama Lengkap"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    required
                />

                <FormInput
                    label="Alamat Email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />

                <SelectInput
                    label="Role Pengguna"
                    value={data.role}
                    onChange={(e) => setData('role', e.target.value)}
                    options={roleOptions}
                    error={errors.role}
                />

                <FormInput
                    label="Ganti Password (Opsional)"
                    type="password"
                    placeholder="Biarkan kosong jika tidak ingin mengubah"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <div className="form-control w-full">
                    <label className="label pb-1">
                        <span className="type-small font-semibold text-[#1E1B4B]">Bio</span>
                    </label>
                    <textarea
                        rows={2}
                        placeholder="Deskripsi singkat..."
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        className="textarea textarea-bordered textarea-brand w-full bg-white text-base text-[#1E1B4B]"
                    />
                    {errors.bio && <span className="type-small mt-1 text-[#B91C1C]">{errors.bio}</span>}
                </div>

                <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            checked={data.verified}
                            onChange={(e) => setData('verified', e.target.checked)}
                            className="checkbox checkbox-primary checkbox-sm border-slate-300"
                        />
                        <span className="type-small text-[#1E1B4B]">Status Email Terverifikasi</span>
                    </label>
                </div>
            </form>
        </BaseModal>
    );
}
