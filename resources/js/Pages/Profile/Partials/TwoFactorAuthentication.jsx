import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';
import { fire } from '@/Components/feedback/Swal';

export default function TwoFactorAuthentication() {
    const { auth, flash } = usePage().props;
    const isEnabled = Boolean(auth?.user?.two_factor_enabled);

    // State untuk setup modal
    const [setupModalOpen, setSetupModalOpen] = useState(false);
    const [setupLoading, setSetupLoading] = useState(false);
    const [setupData, setSetupData] = useState(null); // { secret, qr_code_url, otpauth_url }
    const [recoveryCodesModal, setRecoveryCodesModal] = useState(flash?.recovery_codes || null);
    const [copied, setCopied] = useState(false);

    // Form konfirmasi 6-digit code saat aktivasi
    const confirmForm = useForm({
        code: '',
    });

    // Form password verifikasi saat lihat/disable/regenerate
    const [passwordModalAction, setPasswordModalAction] = useState(null); // 'show_codes' | 'regenerate_codes' | 'disable'
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
                    passwordForm.setError('password', err.response?.data?.errors?.password?.[0] || 'Kata sandi salah.');
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

    function copyRecoveryCodes() {
        if (!recoveryCodesModal) return;
        navigator.clipboard.writeText(recoveryCodesModal.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <section className="card-shell p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Autentikasi Dua Faktor (2FA)</h2>
                        {isEnabled ? (
                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                Aktif
                            </span>
                        ) : (
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                                Nonaktif
                            </span>
                        )}
                    </div>
                    <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                        Tingkatkan keamanan akun Anda dengan verifikasi 6-digit TOTP (Google Authenticator, Authy, dsb.) saat login.
                    </p>
                </div>

                {!isEnabled ? (
                    <button
                        type="button"
                        onClick={startSetup}
                        disabled={setupLoading}
                        className="btn btn-sm shrink-0 border-0 bg-[#6D28D9] text-white hover:bg-[#5b21b6]"
                    >
                        {setupLoading ? 'Menyiapkan...' : 'Aktifkan 2FA'}
                    </button>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                passwordForm.clearErrors();
                                passwordForm.reset();
                                setPasswordModalAction('show_codes');
                            }}
                            className="btn btn-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            Lihat Kode Pemulihan
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                passwordForm.clearErrors();
                                passwordForm.reset();
                                setPasswordModalAction('regenerate_codes');
                            }}
                            className="btn btn-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
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
                            className="btn btn-xs border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                            Nonaktifkan 2FA
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Setup 2FA */}
            {setupModalOpen && setupData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSetupModalOpen(false)}
                    />
                    <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <h3 className="type-h3 text-[#1E1B4B] dark:text-slate-100">Pengaturan Autentikasi Dua Faktor</h3>
                        <p className="type-small mt-2 text-slate-600 dark:text-slate-400">
                            Pindai QR code di bawah menggunakan aplikasi <strong>Google Authenticator</strong>, <strong>Authy</strong>, atau masukkan kunci rahasia secara manual.
                        </p>

                        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4">
                            <img
                                src={setupData.qr_code_url}
                                alt="2FA QR Code"
                                className="h-44 w-44 rounded-lg bg-white p-2 shadow-sm"
                            />
                            <div className="mt-3 w-full text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Kunci Rahasia Manual:</p>
                                <p className="mt-1 font-mono text-xs font-bold tracking-wider text-indigo-700 dark:text-indigo-300 select-all">
                                    {setupData.secret}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmCode} className="mt-4 flex flex-col gap-3">
                            <FormInput
                                label="Masukkan Kode 6-Digit dari Aplikasi"
                                placeholder="Contoh: 123456"
                                maxLength={6}
                                value={confirmForm.data.code}
                                onChange={(e) => confirmForm.setData('code', e.target.value.replace(/\D/g, ''))}
                                error={confirmForm.errors.code}
                                required
                                autoFocus
                            />

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSetupModalOpen(false)}
                                    className="btn btn-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Batal
                                </button>
                                <SolidButton
                                    processing={confirmForm.processing}
                                    variant="amber"
                                    type="submit"
                                >
                                    Verifikasi & Aktifkan
                                </SolidButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tampilan Kode Pemulihan */}
            {recoveryCodesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setRecoveryCodesModal(null)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <h3 className="type-h3 text-[#1E1B4B] dark:text-slate-100">Kode Pemulihan Darurat (2FA)</h3>
                        <p className="type-small mt-2 text-slate-600 dark:text-slate-400">
                            Simpan kode-kode darurat ini di tempat yang aman. Setiap kode hanya dapat digunakan <strong>sekali</strong> jika Anda kehilangan akses ke aplikasi authenticator.
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs font-semibold text-emerald-400">
                            {recoveryCodesModal.map((code, idx) => (
                                <div key={idx} className="tracking-widest">
                                    {code}
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex justify-between gap-2">
                            <button
                                type="button"
                                onClick={copyRecoveryCodes}
                                className="btn btn-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                {copied ? 'Tersalin ke Clipboard' : 'Salin Semua Kode'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setRecoveryCodesModal(null)}
                                className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5b21b6]"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Verifikasi Password Sebelum Aksi Sensitif */}
            {passwordModalAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setPasswordModalAction(null)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <h3 className="type-h3 text-[#1E1B4B] dark:text-slate-100">Konfirmasi Kata Sandi</h3>
                        <p className="type-small mt-2 text-slate-600 dark:text-slate-400">
                            {passwordModalAction === 'disable'
                                ? 'Masukkan kata sandi akun Anda untuk menonaktifkan autentikasi dua faktor.'
                                : 'Masukkan kata sandi akun Anda untuk mengakses kode pemulihan.'}
                        </p>

                        <form onSubmit={handlePasswordAction} className="mt-4 flex flex-col gap-3">
                            <FormInput
                                label="Kata Sandi Akun"
                                type="password"
                                placeholder="Masukkan kata sandi"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                error={passwordForm.errors.password}
                                required
                                autoFocus
                            />

                            <div className="mt-3 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPasswordModalAction(null)}
                                    className="btn btn-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Batal
                                </button>
                                <SolidButton
                                    processing={passwordForm.processing}
                                    variant={passwordModalAction === 'disable' ? 'critical' : 'amber'}
                                    type="submit"
                                >
                                    {passwordModalAction === 'disable' ? 'Nonaktifkan 2FA' : 'Konfirmasi'}
                                </SolidButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
