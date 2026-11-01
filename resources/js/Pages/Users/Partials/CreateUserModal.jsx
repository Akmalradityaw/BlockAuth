import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import BaseModal from '@/Components/ui/BaseModal';
import FormInput from '@/Components/ui/FormInput';
import SelectInput from '@/Components/ui/SelectInput';
import SolidButton from '@/Components/ui/SolidButton';

export default function CreateUserModal({ isOpen, onClose, availableRoles = [] }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: availableRoles[0] || 'Staff',
        bio: '',
        verified: true,
    });

    useEffect(() => {
        if (!isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    function handleSubmit(e) {
        e.preventDefault();
        post('/users', {
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
            title="Tambah Pengguna Baru"
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
                        form="create-user-form"
                        processing={processing}
                        fullWidth={false}
                        variant="primary"
                        className="btn-sm"
                    >
                        Simpan Akun
                    </SolidButton>
                </>
            }
        >
            <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Nama Lengkap"
                    placeholder="Contoh: Budi Pratama"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    required
                />

                <FormInput
                    label="Alamat Email"
                    type="email"
                    placeholder="contoh@gmail.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />

                <FormInput
                    label="Password Awal"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    required
                />

                <SelectInput
                    label="Pilih Role"
                    value={data.role}
                    onChange={(e) => setData('role', e.target.value)}
                    options={roleOptions}
                    error={errors.role}
                />

                <div className="form-control w-full">
                    <label className="label pb-1">
                        <span className="type-small font-semibold text-[#1E1B4B]">Bio (Opsional)</span>
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
                        <span className="type-small text-[#1E1B4B]">
                            Tandai email sebagai langsung terverifikasi
                        </span>
                    </label>
                </div>
            </form>
        </BaseModal>
    );
}
