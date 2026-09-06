import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import FormInput from '@/Components/FormInput';
import SolidButton from '@/Components/SolidButton';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post('/forgot-password');
    }

    return (
        <AuthLayout eyebrow="Pemulihan" title="Lupa password" subtitle="Kami kirim link reset ke email Anda.">
            <Head title="Lupa Password" />
            {status && <div className="alert mb-4 bg-[#EEF2FF] text-sm text-[#1E1B4B]">{status}</div>}
            <form onSubmit={submit} className="flex flex-col gap-3">
                <FormInput
                    label="Email terdaftar"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />
                <SolidButton processing={processing}>Kirim Link Reset</SolidButton>
            </form>
            <p className="type-small mt-4 text-center">
                <Link href="/login" className="font-semibold text-[#6D28D9]">
                    Kembali masuk
                </Link>
            </p>
        </AuthLayout>
    );
}
