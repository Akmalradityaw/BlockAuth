import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Alert from '@/Components/feedback/Alert';
import FormInput from '@/Components/ui/FormInput';
import SolidButton from '@/Components/ui/SolidButton';
import SocialAuthButtons from './Partials/SocialAuthButtons';

export default function Login({ status, authProviders = { google: true, github: true }, isMaintenance = false }) {
    const { flash = {}, features = {} } = usePage().props;
    const isRegistrationEnabled = features.registration ?? true;
    const isMagicLinkEnabled = features.magic_link ?? true;

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <AuthLayout eyebrow="Selamat datang kembali" title="Masuk ke BlockAuth" subtitle="Gunakan email dan password akun Anda.">
            <Head title="Login" />
            {isMaintenance && (
                <div className="mb-4">
                    <Alert variant="warning" title="Mode pemeliharaan">
                        Sistem dalam pemeliharaan. Halaman khusus admin.
                    </Alert>
                </div>
            )}
            {status && <div className="mb-4"><Alert variant="info">{status}</Alert></div>}
            {flash?.warning && <div className="mb-4"><Alert variant="warning">{flash.warning}</Alert></div>}
            <form onSubmit={submit} className="flex flex-col gap-3">
                <FormInput
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />
                <FormInput
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    required
                />
                <div className="flex items-center justify-between">
                    <label className="type-small flex cursor-pointer items-center gap-2">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm border-slate-400"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        Ingat saya
                    </label>
                    <Link href="/forgot-password" className="type-small font-semibold text-[#6D28D9]">
                        Lupa password
                    </Link>
                </div>
                <SolidButton processing={processing}>Masuk</SolidButton>
                {isMagicLinkEnabled && (
                    <div className="mt-1 text-center">
                        <Link
                            href="/magic-link"
                            className="type-small font-semibold text-[#6D28D9] hover:underline"
                        >
                            Masuk tanpa kata sandi via Magic Link
                        </Link>
                    </div>
                )}
            </form>
            <SocialAuthButtons providers={authProviders} mode="login" />
            {isRegistrationEnabled && (
                <p className="type-small mt-4 text-center text-[#334155]">
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-semibold text-[#6D28D9]">
                        Daftar
                    </Link>
                </p>
            )}
        </AuthLayout>
    );
}
