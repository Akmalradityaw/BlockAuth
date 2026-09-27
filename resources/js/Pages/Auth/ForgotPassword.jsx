import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';
import Alert from '@/Components/feedback/Alert';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post('/forgot-password');
    }

    return (
        <AuthLayout
            eyebrow="Pemulihan Akses"
            title="Lupa Password"
            subtitle="Masukkan email terdaftar Anda. Kami akan mengirimkan tautan pemulihan untuk mengatur ulang kata sandi."
        >
            <Head title="Lupa Password" />

            {status && (
                <div className="mb-4">
                    <Alert variant="success" title="Email Terkirim">
                        {status}
                    </Alert>
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <FormInput
                    label="Email Terdaftar"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    autoComplete="email"
                    autoFocus
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />
                <SolidButton processing={processing}>
                    Kirim Tautan Reset Password
                </SolidButton>
            </form>

            <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
                Ingat kata sandi Anda?{' '}
                <Link href="/login" className="font-semibold text-[#6D28D9] dark:text-violet-400 hover:underline">
                    Kembali ke Login
                </Link>
            </p>
        </AuthLayout>
    );
}
