import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';
import { fire } from '@/Components/feedback/Swal';

function DeviceIcon({ type }) {
    if (type === 'mobile') {
        return (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    if (type === 'tablet') {
        return (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        </div>
    );
}

export default function ActiveSessions({ sessions = [] }) {
    const [confirmingLogout, setConfirmingLogout] = useState(false);
    const [revokingId, setRevokingId] = useState(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        password: '',
    });

    async function handleRevokeSession(sessionId, browser, platform) {
        const { isConfirmed } = await fire({
            title: 'Cabut Akses Sesi',
            text: `Apakah Anda yakin ingin memutus akses sesi pada ${browser} (${platform})?`,
            icon: 'warning',
            confirmText: 'Ya, Cabut',
            cancelText: 'Batal',
            showCancelButton: true,
        });

        if (isConfirmed) {
            setRevokingId(sessionId);
            router.delete(`/profile/sessions/${sessionId}`, {
                preserveScroll: true,
                onFinish: () => setRevokingId(null),
            });
        }
    }

    function handleLogoutOther(e) {
        e.preventDefault();
        post('/profile/sessions/revoke-others', {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingLogout(false);
                reset();
            },
        });
    }

    const otherSessionsCount = sessions.filter((s) => !s.is_current_device).length;

    return (
        <section className="card-shell p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Sesi & Perangkat Aktif</h2>
                    <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                        Kelola dan tinjau seluruh sesi login browser dan perangkat yang sedang terhubung ke akun Anda.
                    </p>
                </div>
                {otherSessionsCount > 0 && (
                    <button
                        type="button"
                        onClick={() => {
                            clearErrors();
                            reset();
                            setConfirmingLogout(true);
                        }}
                        className="btn btn-sm shrink-0 border border-red-300 dark:border-red-900/50 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                        Cabut Semua Sesi Lain
                    </button>
                )}
            </div>

            <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {sessions.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        Tidak ada riwayat sesi yang ditemukan.
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-3.5">
                                <DeviceIcon type={session.device_type} />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            {session.browser} pada {session.platform}
                                        </p>
                                        {session.is_current_device ? (
                                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                                Perangkat Ini
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                Sesi Lain
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        IP: <span className="font-mono">{session.ip_address}</span> •{' '}
                                        {session.is_current_device ? (
                                            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Aktif Sekarang</span>
                                        ) : (
                                            <span>Aktif terakhir {session.last_active}</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {!session.is_current_device && (
                                <button
                                    type="button"
                                    disabled={revokingId === session.id}
                                    onClick={() => handleRevokeSession(session.id, session.browser, session.platform)}
                                    className="btn btn-xs self-start sm:self-auto border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400"
                                >
                                    {revokingId === session.id ? 'Mencabut...' : 'Cabut Akses'}
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal Konfirmasi Cabut Semua Sesi Lain */}
            {confirmingLogout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setConfirmingLogout(false)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <h3 className="type-h3 text-[#1E1B4B] dark:text-slate-100">Cabut Semua Sesi Lain</h3>
                        <p className="type-small mt-2 text-slate-600 dark:text-slate-400">
                            Masukkan kata sandi Anda untuk mengonfirmasi bahwa Anda ingin keluar dari semua sesi di perangkat lain.
                        </p>

                        <form onSubmit={handleLogoutOther} className="mt-4 flex flex-col gap-4">
                            <FormInput
                                label="Kata Sandi Anda"
                                type="password"
                                placeholder="Masukkan kata sandi"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                required
                                autoFocus
                            />

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmingLogout(false)}
                                    className="btn btn-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    disabled={processing}
                                >
                                    Batal
                                </button>
                                <SolidButton
                                    processing={processing}
                                    variant="critical"
                                    type="submit"
                                >
                                    Cabut Sesi Lain
                                </SolidButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
