import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import FormInput from '@/Components/ui/FormInput';
import { fire } from '@/Components/feedback/Swal';
import RecoveryCodesModal from './RecoveryCodesModal';

export default function TwoFactorAuthentication() {
    const { auth, flash } = usePage().props;
    const isEnabled = Boolean(auth?.user?.two_factor_enabled);

    const [setupModalOpen, setSetupModalOpen] = useState(false);
    const [setupLoading, setSetupLoading] = useState(false);
    const [setupData, setSetupData] = useState(null);
    const [recoveryCodesModal, setRecoveryCodesModal] = useState(flash?.recovery_codes || null);

    const confirmForm = useForm({
        code: '',
    });

    const [passwordModalAction, setPasswordModalAction] = useState(null);
    const passwordForm = useForm({
        password: '',
    });

    async function startSetup() {
        setSetupLoading(true);
        try {
            const res = await axios.get('/two-factor/setup');
            setSetupData(res.data);
            setSetupModalOpen(true);
        } catch (err) {
            await fire({
                title: 'Gagal Menyiapkan 2FA',
                text: 'Terjadi kesalahan saat membuat kode rahasia. Silakan coba lagi.',
                icon: 'error',
            });
        } finally {
            setSetupLoading(false);
        }
    }

    function handleConfirmCode(e) {
        e.preventDefault();
        confirmForm.post('/two-factor/confirm', {
            preserveScroll: true,
            onSuccess: (page) => {
                setSetupModalOpen(false);
                confirmForm.reset();
                if (page.props.flash?.recovery_codes) {
                    setRecoveryCodesModal(page.props.flash.recovery_codes);
                }
            },
        });
    }

    function handlePasswordAction(e) {
        e.preventDefault();
        if (passwordModalAction === 'show_codes') {
            axios.post('/two-factor/recovery-codes', { password: passwordForm.data.password })
                .then((res) => {
                    setPasswordModalAction(null);
                    passwordForm.reset();
                    setRecoveryCodesModal(res.data.recovery_codes);
                })
                .catch((err) => {
                    passwordForm.setError('password', err.response?.data?.errors?.password?.[0] || 'Kata sandi tidak sesuai.');
                });
        } else if (passwordModalAction === 'regenerate_codes') {
            passwordForm.post('/two-factor/recovery-codes/regenerate', {
                preserveScroll: true,
                onSuccess: (page) => {
                    setPasswordModalAction(null);
                    passwordForm.reset();
                    if (page.props.flash?.recovery_codes) {
                        setRecoveryCodesModal(page.props.flash.recovery_codes);
                    }
                },
            });
        } else if (passwordModalAction === 'disable') {
            passwordForm.delete('/two-factor', {
                preserveScroll: true,
                onSuccess: () => {
                    setPasswordModalAction(null);
                    passwordForm.reset();
                },
            });
        }
    }

    return (
        <section className="card-shell p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 pb-4">
                <div className="flex-1 pr-0 sm:pr-4">
                    <div className="flex items-center gap-2">
                        <h2 className="type-h2 font-bold text-[#1E1B4B]">Autentikasi Dua Faktor (2FA)</h2>
                        {isEnabled ? (
                            <span className="badge border-0 bg-emerald-100 text-xs font-semibold text-emerald-800">
                                Aktif
                            </span>
                        ) : (
                            <span className="badge border-0 bg-slate-100 text-xs font-medium text-slate-600">
                                Nonaktif
                            </span>
                        )}
                    </div>
                    <p className="type-small mt-1 text-[#334155]">
                        Tingkatkan keamanan akun dengan verifikasi kode 6 digit dari Google Authenticator atau aplikasi TOTP lainnya.
                    </p>
                </div>

                <div className="shrink-0 pt-1">
                    {!isEnabled ? (
                        <button
                            type="button"
                            onClick={startSetup}
                            disabled={setupLoading}
                            className="btn btn-sm border-0 bg-[#6D28D9] font-semibold text-white hover:bg-[#5b21b6] disabled:opacity-60"
                        >
                            {setupLoading ? 'Memuat...' : 'Aktifkan 2FA'}
                        </button>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    passwordForm.clearErrors();
                                    passwordForm.reset();
                                    setPasswordModalAction('show_codes');
                                }}
                                className="btn btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            >
                                Kode Pemulihan
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    passwordForm.clearErrors();
                                    passwordForm.reset();
                                    setPasswordModalAction('regenerate_codes');
                                }}
                                className="btn btn-sm border border-amber-300 bg-white text-amber-700 hover:bg-amber-50"
                            >
                                Buat Ulang Kode
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    passwordForm.clearErrors();
                                    passwordForm.reset();
                                    setPasswordModalAction('disable');
                                }}
                                className="btn btn-sm border border-red-300 bg-white text-red-700 hover:bg-red-50"
                            >
                                Nonaktifkan
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 text-sm text-[#334155]">
                {isEnabled ? (
                    <p>
                        Autentikasi dua faktor saat ini aktif. Setiap kali masuk ke sistem, Anda akan diminta memasukkan kode 6 digit dari aplikasi autentikator atau kode pemulihan darurat.
                    </p>
                ) : (
                    <p>
                        Saat diaktifkan, Anda perlu memindai kode QR menggunakan aplikasi authenticator di ponsel Anda sebelum dapat mengonfirmasi perlindungan 2FA.
                    </p>
                )}
            </div>

            {/* Modal Setup 2FA */}
            {setupModalOpen && setupData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                        <h3 className="text-base font-bold text-[#1E1B4B]">
                            Pengaturan Autentikasi Dua Faktor
                        </h3>
                        <p className="mt-1 text-xs text-[#334155]">
                            Pindai kode QR di bawah ini menggunakan aplikasi authenticator Anda (Google Authenticator, Authy, Microsoft Authenticator).
                        </p>

                        <div className="mt-4 flex flex-col items-center justify-center">
                            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                                <img
                                    src={setupData.qr_code_url}
                                    alt="2FA QR Code"
                                    className="h-44 w-44 object-contain"
                                />
                            </div>
                            <p className="mt-3 text-xs text-slate-500">
                                Kunci Rahasia Manual:
                            </p>
                            <span className="mt-0.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold tracking-wider text-[#1E1B4B]">
                                {setupData.secret}
                            </span>
                        </div>

                        <form onSubmit={handleConfirmCode} className="mt-5 space-y-4">
                            <FormInput
                                id="setup_totp_code"
                                label="Kode Verifikasi 6 Digit"
                                type="text"
                                maxLength={6}
                                placeholder="Contoh: 123456"
                                value={confirmForm.data.code}
                                onChange={(e) => confirmForm.setData('code', e.target.value)}
                                error={confirmForm.errors.code}
                                required
                                autoFocus
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSetupModalOpen(false)}
                                    className="btn btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                    disabled={confirmForm.processing}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={confirmForm.processing}
                                    className="btn btn-sm border-0 bg-[#6D28D9] font-semibold text-white hover:bg-[#5b21b6] disabled:opacity-60"
                                >
                                    {confirmForm.processing ? 'Menyimpan...' : 'Konfirmasi & Aktifkan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Password Confirmation */}
            {passwordModalAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                        <h3 className="text-base font-bold text-[#1E1B4B]">
                            Konfirmasi Kata Sandi
                        </h3>
                        <p className="mt-1 text-xs text-[#334155]">
                            {passwordModalAction === 'disable'
                                ? 'Masukkan kata sandi Anda untuk menonaktifkan autentikasi dua faktor.'
                                : 'Masukkan kata sandi Anda untuk melihat kode pemulihan darurat.'}
                        </p>

                        <form onSubmit={handlePasswordAction} className="mt-4 space-y-4">
                            <FormInput
                                id="two_factor_password_confirm"
                                label="Kata Sandi Akun"
                                type="password"
                                placeholder="Masukkan kata sandi"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                error={passwordForm.errors.password}
                                required
                                autoFocus
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPasswordModalAction(null)}
                                    className="btn btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                    disabled={passwordForm.processing}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className={`btn btn-sm border-0 font-semibold text-white disabled:opacity-60 ${passwordModalAction === 'disable' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#6D28D9] hover:bg-[#5b21b6]'}`}
                                >
                                    {passwordForm.processing ? 'Memproses...' : passwordModalAction === 'disable' ? 'Nonaktifkan 2FA' : 'Lanjutkan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Display Recovery Codes */}
            {recoveryCodesModal && (
                <RecoveryCodesModal codes={recoveryCodesModal} onClose={() => setRecoveryCodesModal(null)} />
            )}
        </section>
    );
}
