import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';
import { fire } from '@/Components/feedback/Swal';

function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export default function PasskeyManager({ passkeys = [] }) {
    const [registering, setRegistering] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isWebAuthnSupported = typeof window !== 'undefined' && Boolean(window.PublicKeyCredential);

    async function handleStartRegistration(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Dapatkan opsi dari backend
            const { data: options } = await axios.get('/passkeys/register-options');

            // 2. Decode challenge dan user id ke Buffer
            options.challenge = base64ToBuffer(options.challenge);
            options.user.id = base64ToBuffer(options.user.id);

            // 3. Panggil API WebAuthn browser / perangkat
            const credential = await navigator.credentials.create({
                publicKey: options,
            });

            if (!credential) {
                throw new Error('Pembuatan kredensial biometrik dibatalkan.');
            }

            // 4. Encode credential ID ke base64
            const credentialId = bufferToBase64(credential.rawId);

            // 5. Kirim kredensial ke backend
            router.post(
                '/passkeys/register',
                {
                    name: name.trim() || 'Kredensial Biometrik',
                    credential_id: credentialId,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setRegistering(false);
                        setName('');
                        setLoading(false);
                    },
                    onError: (err) => {
                        setError(err.name || err.credential_id || 'Gagal menyimpan passkey.');
                        setLoading(false);
                    },
                }
            );
        } catch (err) {
            console.error(err);
            if (err.name === 'NotAllowedError') {
                setError('Operasi dibatalkan atau waktu verifikasi habis.');
            } else {
                setError(err.message || 'Perangkat tidak dapat menyelesaikan registrasi passkey.');
            }
            setLoading(false);
        }
    }

    async function handleDelete(pk) {
        const { isConfirmed } = await fire({
            title: 'Hapus Passkey',
            text: `Apakah Anda yakin ingin menghapus passkey '${pk.name}'? Anda tidak dapat lagi menggunakannya untuk login instan.`,
            icon: 'warning',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
        });

        if (isConfirmed) {
            router.delete(`/passkeys/${pk.id}`, {
                preserveScroll: true,
            });
        }
    }

    return (
        <section className="card-shell p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="type-h3 text-[#1E1B4B] dark:text-slate-100">Passkeys & Kredensial Biometrik</h2>
                    <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                        Masuk ke akun Anda secara instan dan tanpa kata sandi menggunakan sensor sidik jari, pengenalan wajah (Face ID / Windows Hello), atau kunci keamanan hardware (FIDO2 / YubiKey).
                    </p>
                </div>
                {isWebAuthnSupported ? (
                    <button
                        type="button"
                        onClick={() => {
                            setName('Biometrik ' + (navigator.platform ? `(${navigator.platform})` : ''));
                            setRegistering(true);
                            setError('');
                        }}
                        className="btn btn-sm shrink-0 border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
                    >
                        <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004 11m0 0a8 8 0 001.272 4.316m3.84 3.916A11.954 11.954 0 0012 21c2.148 0 4.148-.564 5.875-1.554" />
                        </svg>
                        Daftarkan Passkey Baru
                    </button>
                ) : (
                    <span className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                        Browser tidak mendukung WebAuthn
                    </span>
                )}
            </div>

            {/* List Passkeys */}
            <div className="mt-6">
                {passkeys.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004 11m0 0a8 8 0 001.272 4.316m3.84 3.916A11.954 11.954 0 0012 21c2.148 0 4.148-.564 5.875-1.554" />
                            </svg>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Belum ada Passkey yang terdaftar</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Daftarkan sensor biometrik atau kunci keamanan fisik untuk proses login yang lebih cepat dan aman.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        {passkeys.map((pk) => (
                            <div key={pk.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004 11m0 0a8 8 0 001.272 4.316m3.84 3.916A11.954 11.954 0 0012 21c2.148 0 4.148-.564 5.875-1.554" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{pk.name}</p>
                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                            Ditambahkan: {pk.created_at} &bull; Terakhir digunakan: {pk.last_used_at}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(pk)}
                                    className="btn btn-xs shrink-0 border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                                >
                                    Hapus Passkey
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Tambah Passkey */}
            {registering && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="type-h3 text-slate-800 dark:text-slate-100">Daftarkan Passkey Baru</h3>
                            <button
                                type="button"
                                onClick={() => setRegistering(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {error && (
                            <div className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleStartRegistration} className="mt-4 flex flex-col gap-4">
                            <FormInput
                                label="Nama Perangkat / Kredensial"
                                placeholder="Misal: Windows Hello Laptop, Face ID iPhone"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3 text-xs text-slate-600 dark:text-slate-300">
                                Setelah menekan tombol &quot;Verifikasi Perangkat&quot;, ikuti instruksi sistem operasi atau browser Anda (sentuh sensor sidik jari, hadapkan wajah, atau masukkan PIN perangkat).
                            </div>

                            <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setRegistering(false)}
                                    disabled={loading}
                                    className="btn btn-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Batal
                                </button>
                                <SolidButton processing={loading}>
                                    Verifikasi Perangkat
                                </SolidButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
