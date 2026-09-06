import { useForm } from '@inertiajs/react';
import FormInput from '@/Components/FormInput';
import SolidButton from '@/Components/SolidButton';

export default function UpdatePasswordForm() {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        put('/password', { onSuccess: () => reset() });
    }

    return (
        <section className="card-shell p-4 sm:p-6">
            <h2 className="type-h2 text-[#1E1B4B]">Keamanan akun</h2>
            <p className="type-small mt-1 text-[#334155]">Gunakan password kuat yang belum dipakai di tempat lain.</p>
            <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
                <FormInput
                    label="Password saat ini"
                    type="password"
                    autoComplete="current-password"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    error={errors.current_password}
                    required
                />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <FormInput
                        label="Password baru"
                        type="password"
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        required
                    />
                    <FormInput
                        label="Konfirmasi baru"
                        type="password"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                </div>
                <SolidButton processing={processing} variant="amber">
                    Perbarui password
                </SolidButton>
            </form>
        </section>
    );
}
