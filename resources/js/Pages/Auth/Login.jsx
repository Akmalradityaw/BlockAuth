import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Alert from '@/Components/feedback/Alert';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';

export default function Login({ status, authProviders = { google: true, github: true }, isMaintenance = false }) {
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
            </form>
            {(authProviders.google || authProviders.github) && (
                <>
                    <div className="my-4 flex items-center gap-3">
                        <span className="h-px flex-1 bg-slate-200" />
                        <span className="type-caption text-[#334155]">atau lanjut dengan</span>
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className={`grid gap-2 ${authProviders.google && authProviders.github ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {authProviders.google && (
                            <a href="/oauth/google/redirect" className="btn border border-slate-300 bg-white text-[#1E1B4B]">
                                Google
                            </a>
                        )}
                        {authProviders.github && (
                            <a href="/oauth/github/redirect" className="btn border-0 bg-[#1E1B4B] text-white">
                                GitHub
                            </a>
                        )}
                    </div>
                </>
            )}
            <p className="type-small mt-4 text-center text-[#334155]">
                Belum punya akun?{' '}
                <Link href="/register" className="font-semibold text-[#6D28D9]">
                    Daftar
                </Link>
            </p>
        </AuthLayout>
    );
}
