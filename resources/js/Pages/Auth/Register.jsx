import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';
import PasswordStrengthMeter from '@/Components/forms/PasswordStrengthMeter';

export default function Register({ authProviders = { google: true, github: true } }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/register');
    }

    return (
        <AuthLayout
            eyebrow="Registrasi Akun Baru"
            title="Daftar ke BlockAuth"
            subtitle="Buat akun baru untuk mulai mengakses infrastruktur keamanan enterprise."
        >
            <Head title="Registrasi Akun" />

            <form onSubmit={submit} className="flex flex-col gap-3.5">
                <FormInput
                    label="Nama Lengkap"
                    placeholder="Nama Lengkap Anda"
                    autoComplete="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    required
                />

                <FormInput
                    label="Username"
                    placeholder="contoh: budi_santoso"
                    autoComplete="username"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    error={errors.username}
                    required
                />

                <FormInput
                    label="Email"
                    type="email"
                    placeholder="nama@perusahaan.com"
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

                <SolidButton processing={processing} variant="amber">
                    Daftar Akun Baru
                </SolidButton>
            </form>

            {(authProviders.google || authProviders.github) && (
                <>
                    <div className="my-4 flex items-center gap-3">
                        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Atau Daftar Melalui
                        </span>
                        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    </div>

                    <div className={`grid gap-2.5 ${authProviders.google && authProviders.github ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {authProviders.google && (
                            <a
                                href="/oauth/google/redirect"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.14z"/>
                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.93H1.28v3.13C3.25 21.3 7.31 24 12 24z"/>
                                    <path fill="#FBBC05" d="M5.33 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.4l4.05-3.13z"/>
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.6l4.05 3.13c.94-2.83 3.57-4.98 6.67-4.98z"/>
                                </svg>
                                Google
                            </a>
                        )}
                        {authProviders.github && (
                            <a
                                href="/oauth/github/redirect"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#1E1B4B] py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                </svg>
                                GitHub
                            </a>
                        )}
                    </div>
                </>
            )}

            <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
                Sudah memiliki akun?{' '}
                <Link href="/login" className="font-semibold text-[#6D28D9] dark:text-violet-400 hover:underline">
                    Masuk ke Akun
                </Link>
            </p>
        </AuthLayout>
    );
}
