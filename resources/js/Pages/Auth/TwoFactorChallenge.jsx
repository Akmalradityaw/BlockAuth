import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import FormInput from '@/Components/ui/FormInput';
import SolidButton from '@/Components/ui/SolidButton';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);

    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    function toggleMode() {
        clearErrors();
        reset();
        setUseRecovery(!useRecovery);
    }

    function submit(e) {
        e.preventDefault();
        post('/two-factor-challenge');
    }

    return (
        <AuthLayout
            eyebrow="Verifikasi Keamanan"
            title="Autentikasi Dua Faktor"
            subtitle={
                useRecovery
                    ? 'Masukkan salah satu kode pemulihan darurat akun Anda.'
                    : 'Buka aplikasi authenticator Anda untuk melihat kode verifikasi 6 digit.'
            }
        >
            <Head title="Verifikasi 2FA" />

            <form onSubmit={submit} className="flex flex-col gap-4">
                {!useRecovery ? (
                    <FormInput
                        id="2fa_code"
                        label="Kode Authenticator (6 Digit)"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value)}
                        error={errors.code}
                        required
                        autoFocus
                    />
                ) : (
                    <FormInput
                        id="2fa_recovery_code"
                        label="Kode Pemulihan Darurat"
                        type="text"
                        placeholder="XXXX-XXXX"
                        value={data.recovery_code}
                        onChange={(e) => setData('recovery_code', e.target.value)}
                        error={errors.recovery_code}
                        required
                        autoFocus
                    />
                )}

                <SolidButton
                    type="submit"
                    loading={processing}
                    size="md"
                    className="w-full !bg-[#6D28D9] !text-white hover:!bg-[#5b21b6]"
                >
                    Verifikasi & Masuk
                </SolidButton>

                <div className="flex flex-col items-center gap-2 pt-2 text-center">
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-xs font-semibold text-[#6D28D9] hover:underline"
                    >
                        {useRecovery
                            ? 'Gunakan kode aplikasi authenticator'
                            : 'Gunakan kode pemulihan darurat'}
                    </button>

                    <Link
                        href="/login"
                        className="text-xs text-slate-500 hover:text-slate-800"
                    >
                        Batalkan dan kembali ke halaman Login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

