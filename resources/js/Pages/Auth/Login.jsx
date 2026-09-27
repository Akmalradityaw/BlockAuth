import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import AuthLayout from '@/Layouts/AuthLayout';
import Alert from '@/Components/feedback/Alert';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';

export default function Login({ status, authProviders = { google: true, github: true }, isMaintenance = false }) {
    const [passkeyLoading, setPasskeyLoading] = useState(false);
    const [passkeyError, setPasskeyError] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    async function handlePasskeyLogin() {
        setPasskeyError('');
        setPasskeyLoading(true);

        try {
            if (!window.PublicKeyCredential) {
                throw new Error('Browser ini tidak mendukung autentikasi Passkey / WebAuthn.');
            }

            const { data: options } = await axios.post('/passkeys/login-options', {
                email: data.login || null,
            });

            const challengeBytes = Uint8Array.from(atob(options.challenge), (c) => c.charCodeAt(0));
            options.challenge = challengeBytes;

            if (options.allowCredentials && options.allowCredentials.length > 0) {
                options.allowCredentials = options.allowCredentials.map((cred) => ({
                    ...cred,
                    id: Uint8Array.from(atob(cred.id), (c) => c.charCodeAt(0)),
                }));
            }

            const assertion = await navigator.credentials.get({
                publicKey: options,
            });

            if (!assertion) {
                throw new Error('Autentikasi biometrik dibatalkan.');
            }

            const bytes = new Uint8Array(assertion.rawId);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const credentialId = window.btoa(binary);

            const res = await axios.post('/passkeys/login', {
                credential_id: credentialId,
            });

            if (res.data.success && res.data.redirect) {
                window.location.href = res.data.redirect;
            }
        } catch (err) {
            console.error(err);
            if (err.name === 'NotAllowedError') {
                setPasskeyError('Verifikasi biometrik dibatalkan atau waktu habis.');
            } else {
                setPasskeyError(err.response?.data?.message || err.message || 'Gagal masuk menggunakan Passkey.');
            }
        } finally {
            setPasskeyLoading(false);
        }
    }

    const isSecurityLockout = errors.login && (
        errors.login.includes('dikunci') || 
        errors.login.includes('Peringatan keamanan') || 
        errors.login.includes('Terlalu banyak')
    );

    return (
        <AuthLayout
            eyebrow="Selamat Datang Kembali"
            title="Masuk ke BlockAuth"
            subtitle="Gunakan email & kata sandi, passkey biometrik, atau akun sosial Anda."
        >
            <Head title="Masuk ke Akun" />

            {isMaintenance && (
                <div className="mb-4">
                    <Alert variant="warning" title="Mode Pemeliharaan Aktif">
                        Sistem sedang dalam mode pemeliharaan. Akses dibatasi untuk administrator.
                    </Alert>
                </div>
            )}

            {status && (
                <div className="mb-4">
                    <Alert variant="info">{status}</Alert>
                </div>
            )}

            {isSecurityLockout && (
                <div className="mb-4">
                    <Alert variant="danger" title="Proteksi Keamanan Aktif">
                        {errors.login}
                    </Alert>
                </div>
            )}

            {passkeyError && (
                <div className="mb-4">
                    <Alert variant="warning" title="Autentikasi Biometrik">
                        {passkeyError}
                    </Alert>
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-3.5">
                <FormInput
                    label="Email atau Username"
                    type="text"
                    placeholder="nama@perusahaan.com / budi_santoso"
                    autoComplete="username"
                    value={data.login}
                    onChange={(e) => setData('login', e.target.value)}
                    error={isSecurityLockout ? undefined : errors.login}
                    required
                />

                <FormInput
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    required
                />

                <div className="flex items-center justify-between text-xs">
                    <label className="flex cursor-pointer items-center gap-2 text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span>Ingat saya di perangkat ini</span>
                    </label>
                    <Link
                        href="/forgot-password"
                        className="font-semibold text-[#6D28D9] transition hover:underline dark:text-violet-400"
                    >
                        Lupa password?
                    </Link>
                </div>

                <SolidButton processing={processing}>
                    Masuk ke Akun
                </SolidButton>

                <button
                    type="button"
                    onClick={handlePasskeyLogin}
                    disabled={passkeyLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                    <svg className="h-4 w-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004 11m0 0a8 8 0 001.272 4.316m3.84 3.916A11.954 11.954 0 0012 21c2.148 0 4.148-.564 5.875-1.554" />
                    </svg>
                    {passkeyLoading ? 'Memverifikasi Biometrik...' : 'Masuk dengan Passkey Biometrik'}
                </button>
            </form>

            {(authProviders.google || authProviders.github) && (
                <>
                    <div className="my-4 flex items-center gap-3">
                        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Atau Masuk Melalui
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
                Belum memiliki akun?{' '}
                <Link href="/register" className="font-semibold text-[#6D28D9] dark:text-violet-400 hover:underline">
                    Daftar Akun Baru
                </Link>
            </p>
        </AuthLayout>
    );
}
