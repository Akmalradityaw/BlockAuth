import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import SolidButton from '@/Components/forms/SolidButton';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        code: '',
        recovery_code: '',
    });

    function toggleMode() {
        clearErrors();
        setData({ code: '', recovery_code: '' });
        setUseRecovery(!useRecovery);
    }

    function submit(e) {
        e.preventDefault();
        post('/two-factor-challenge');
    }

    return (
        <AuthLayout
            eyebrow="Verifikasi Keamanan"
            title="Autentikasi Dua Faktor (2FA)"
            subtitle={
                useRecovery
                    ? 'Masukkan salah satu kode pemulihan darurat sekali pakai Anda.'
                    : 'Buka aplikasi authenticator Anda dan masukkan kode 6-digit yang ditampilkan.'
            }
        >
            <Head title="Verifikasi Dua Faktor" />

            {/* Kotak Petunjuk */}
            <div className="mb-5 rounded-xl border border-violet-200 bg-violet-50/70 p-3.5 text-xs leading-relaxed text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200">
                {!useRecovery ? (
                    <div className="flex items-start gap-2.5">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>
                            Buka aplikasi <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, atau <strong>Authy</strong> di perangkat Anda, lalu masukkan 6 angka kode yang valid.
                        </span>
                    </div>
                ) : (
                    <div className="flex items-start gap-2.5">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>
                            Gunakan salah satu dari 8 kode pemulihan darurat yang Anda unduh saat aktivasi. Setiap kode hanya dapat dipakai satu kali.
                        </span>
                    </div>
                )}
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
                {!useRecovery ? (
                    <div className="form-control w-full">
                        <label className="label pb-1.5">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                Kode Verifikasi 6-Digit
                            </span>
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="000000"
                            maxLength={6}
                            autoFocus
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                            className={`input input-bordered w-full text-center font-mono text-2xl font-bold tracking-[0.35em] transition-colors ${
                                errors.code
                                    ? 'border-red-500 focus:border-red-500 focus:outline-red-500'
                                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-violet-600 focus:outline-violet-600'
                            }`}
                            required
                        />
                        {errors.code && (
                            <span className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.code}</span>
                        )}
                        <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                            Kode berganti otomatis setiap 30 detik pada aplikasi Anda.
                        </span>
                    </div>
                ) : (
                    <div className="form-control w-full">
                        <label className="label pb-1.5">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                Kode Pemulihan Darurat
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: A1B2-C3D4"
                            autoFocus
                            value={data.recovery_code}
                            onChange={(e) => setData('recovery_code', e.target.value.toUpperCase())}
                            className={`input input-bordered w-full font-mono text-base font-semibold tracking-wider transition-colors ${
                                errors.recovery_code
                                    ? 'border-red-500 focus:border-red-500 focus:outline-red-500'
                                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-violet-600 focus:outline-violet-600'
                            }`}
                            required
                        />
                        {errors.recovery_code && (
                            <span className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.recovery_code}</span>
                        )}
                    </div>
                )}

                <SolidButton processing={processing} variant="amber">
                    Verifikasi & Masuk ke Dashboard
                </SolidButton>

                <div className="flex flex-col items-center gap-2.5 pt-2 text-center">
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-xs font-semibold text-[#6D28D9] dark:text-violet-400 hover:underline"
                    >
                        {useRecovery
                            ? '← Gunakan kode aplikasi authenticator (TOTP)'
                            : 'Kehilangan akses perangkat? Gunakan kode pemulihan darurat'}
                    </button>

                    <Link
                        href="/login"
                        className="text-xs text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        Batal dan kembali ke halaman login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
