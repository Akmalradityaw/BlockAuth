import { Head, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';
import PasswordStrengthMeter from '@/Components/forms/PasswordStrengthMeter';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/reset-password');
    }

    return (
        <AuthLayout
            eyebrow="Pemulihan Akun"
            title="Atur Ulang Password"
            subtitle="Buat kata sandi baru yang aman untuk memulihkan akses akun Anda."
        >
            <Head title="Reset Password" />

            <form onSubmit={submit} className="flex flex-col gap-3.5">
                <FormInput
                    label="Email Terdaftar"
                    type="email"
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />

                <div className="grid gap-3 sm:grid-cols-2">
                    <FormInput
                        label="Password Baru"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        required
                    />
                    <FormInput
                        label="Konfirmasi Password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                </div>

                <PasswordStrengthMeter password={data.password} />

                <SolidButton processing={processing}>
                    Simpan Kata Sandi Baru
                </SolidButton>
            </form>
        </AuthLayout>
    );
}
