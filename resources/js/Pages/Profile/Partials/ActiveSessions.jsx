import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import FormInput from '@/Components/ui/FormInput';
import SolidButton from '@/Components/ui/SolidButton';
import { fire } from '@/Components/feedback/Swal';

function DeviceIcon({ type }) {
    if (type === 'mobile') {
        return (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    if (type === 'tablet') {
        return (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6D28D9]">
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
                <div>
                    <h2 className="type-h2 font-bold text-[#1E1B4B]">Sesi & Perangkat Aktif</h2>
                    <p className="type-small mt-1 text-[#334155]">
                        Tinjau dan kelola seluruh sesi browser yang sedang terhubung ke akun Anda.
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
                        className="btn btn-sm shrink-0 border border-red-300 bg-white text-red-700 hover:bg-red-50"
                    >
                        Cabut Semua Sesi Lain
                    </button>
                )}
            </div>

            <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                {sessions.length === 0 ? (
                    <div className="p-6 text-center text-sm text-[#334155]">
                        Tidak ada riwayat sesi yang ditemukan.
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <DeviceIcon type={session.device_type} />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-[#1E1B4B]">
                                            {session.browser} pada {session.platform}
                                        </p>
                                        {session.is_current_device ? (
                                            <span className="badge border-0 bg-green-100 text-xs font-semibold text-green-800">
                                                Perangkat Ini
                                            </span>
                                        ) : (
                                            <span className="badge border-0 bg-slate-100 text-xs font-medium text-slate-600">
                                                Sesi Lain
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 type-small text-[#334155]">
                                        IP: <span className="font-mono">{session.ip_address}</span> •{' '}
                                        {session.is_current_device ? (
                                            <span className="font-medium text-green-700">Aktif Sekarang</span>
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
                                    className="btn btn-xs self-start border border-slate-300 bg-white text-[#1E1B4B] hover:bg-red-50 hover:text-red-700 sm:self-auto"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="card-shell w-full max-w-md bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="type-h3 font-bold text-[#1E1B4B]">Cabut Semua Sesi Lain</h3>
                            <button
                                type="button"
                                onClick={() => setConfirmingLogout(false)}
                                className="btn btn-circle btn-ghost btn-xs text-slate-500 hover:text-[#1E1B4B]"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="type-small mt-3 text-[#334155]">
                            Masukkan kata sandi akun Anda untuk mengonfirmasi bahwa Anda ingin keluar dari semua perangkat lain.
                        </p>

                        <form onSubmit={handleLogoutOther} className="mt-4 flex flex-col gap-4">
                            <FormInput
                                label="Kata Sandi Akun"
                                type="password"
                                placeholder="Masukkan kata sandi Anda"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                required
                                autoFocus
                            />

                            <div className="mt-2 flex justify-end gap-2 border-t border-slate-200 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setConfirmingLogout(false)}
                                    className="btn btn-sm border border-slate-300 bg-white text-[#334155] hover:bg-slate-100"
                                    disabled={processing}
                                >
                                    Batal
                                </button>
                                <div className="w-44">
                                    <SolidButton
                                        processing={processing}
                                        type="submit"
                                        variant="amber"
                                    >
                                        Cabut Sesi Lain
                                    </SolidButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

