import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import FormInput from '@/Components/FormInput';
import SolidButton from '@/Components/SolidButton';

export default function Login({ status }) {
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
            {status && <div className="alert mb-4 bg-[#EEF2FF] text-sm text-[#1E1B4B]">{status}</div>}
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
            <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="type-caption text-[#334155]">atau lanjut dengan</span>
                <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <a href="/oauth/google/redirect" className="btn border border-slate-300 bg-white text-[#1E1B4B]">
                    Google
                </a>
                <a href="/oauth/github/redirect" className="btn border-0 bg-[#1E1B4B] text-white">
                    GitHub
                </a>
            </div>
            <p className="type-small mt-4 text-center text-[#334155]">
                Belum punya akun?{' '}
                <Link href="/register" className="font-semibold text-[#6D28D9]">
                    Daftar
                </Link>
            </p>
        </AuthLayout>
    );
}
