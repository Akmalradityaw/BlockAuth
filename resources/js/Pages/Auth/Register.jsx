import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import FormInput from '@/Components/FormInput';
import SolidButton from '@/Components/SolidButton';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/register');
    }

    return (
        <AuthLayout eyebrow="Akun baru" title="Daftar BlockAuth" subtitle="Nama, email valid, dan password minimal 8 karakter.">
            <Head title="Register" />
            <form onSubmit={submit} className="flex flex-col gap-3">
                <FormInput
                    label="Nama lengkap"
                    autoComplete="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    required
                />
                <FormInput
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />
                <div className="grid gap-3 sm:grid-cols-2">
                    <FormInput
                        label="Password"
                        type="password"
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        required
                    />
                    <FormInput
                        label="Konfirmasi"
                        type="password"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                </div>
                <SolidButton processing={processing} variant="amber">
                    Buat Akun
                </SolidButton>
            </form>
            <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="type-caption text-[#334155]">atau daftar dengan</span>
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
                Sudah punya akun?{' '}
                <Link href="/login" className="font-semibold text-[#6D28D9]">
                    Masuk
                </Link>
            </p>
        </AuthLayout>
    );
}
