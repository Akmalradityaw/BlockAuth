import { useState, useEffect } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';
import { fire } from '@/Components/feedback/Swal';

export default function ApiTokenManager({ tokens = [] }) {
    const { flash } = usePage().props;
    const [creating, setCreating] = useState(false);
    const [displayToken, setDisplayToken] = useState(null);
    const [copied, setCopied] = useState(false);

    // Watch for new_token in flash
    useEffect(() => {
        if (flash?.new_token) {
            setDisplayToken(flash.new_token);
        }
    }, [flash]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        abilities: ['read'],
    });

    function toggleAbility(ability) {
        if (data.abilities.includes(ability)) {
            setData('abilities', data.abilities.filter((a) => a !== ability));
        } else {
            setData('abilities', [...data.abilities, ability]);
        }
    }

    function handleCreate(e) {
        e.preventDefault();
        post('/profile/tokens', {
            preserveScroll: true,
            onSuccess: (page) => {
                reset();
                setCreating(false);
                if (page.props.flash?.new_token) {
                    setDisplayToken(page.props.flash.new_token);
                }
            },
        });
    }

    async function handleRevoke(token) {
        const { isConfirmed } = await fire({
            title: 'Cabut API Token',
            text: `Apakah Anda yakin ingin mencabut token '${token.name}'? Aplikasi atau integrasi yang menggunakan token ini tidak dapat lagi mengakses API.`,
            icon: 'warning',
            confirmText: 'Ya, Cabut Token',
            cancelText: 'Batal',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
        });

        if (isConfirmed) {
            router.delete(`/profile/tokens/${token.id}`, {
                preserveScroll: true,
            });
        }
    }

    function copyToClipboard() {
        if (displayToken?.plainTextToken) {
            navigator.clipboard.writeText(displayToken.plainTextToken);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    }

    return (
        <section className="card-shell p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="type-h3 text-[#1E1B4B] dark:text-slate-100">API & Personal Access Tokens</h2>
                    <p className="type-small mt-1 text-[#334155] dark:text-slate-400">
                        Buat token autentikasi API untuk mengintegrasikan layanan eksternal atau skrip otomasi dengan BlockAuth.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="btn btn-sm shrink-0 border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
                >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Buat Token Baru
                </button>
            </div>

            {/* List Tokens */}
            <div className="mt-6">
                {tokens.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Belum ada API Token aktif</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Klik tombol &quot;Buat Token Baru&quot; untuk menghasilkan kredensial akses API Sanctum.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        {tokens.map((token) => (
                            <div key={token.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{token.name}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {token.abilities?.map((ability) => (
                                                <span
                                                    key={ability}
                                                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                                                        ability === 'read'
                                                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50'
                                                            : ability === 'write'
                                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
                                                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                                                    }`}
                                                >
                                                    {ability}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Dibuat: {token.created_at} &bull; Terakhir digunakan: {token.last_used_at}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRevoke(token)}
                                    className="btn btn-xs shrink-0 border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                                >
                                    Cabut Token
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Buat Token */}
            {creating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="type-h3 text-slate-800 dark:text-slate-100">Buat API Personal Access Token</h3>
                            <button
                                type="button"
                                onClick={() => setCreating(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-4">
                            <FormInput
                                label="Nama Token"
                                placeholder="Misal: Script Backup, CI/CD Pipeline, Mobile App"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />

                            <div>
                                <label className="type-small mb-2 block font-semibold text-slate-700 dark:text-slate-200">
                                    Hak Akses (Abilities)
                                </label>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    {[
                                        { key: 'read', label: 'Read', desc: 'Membaca data dan profil' },
                                        { key: 'write', label: 'Write', desc: 'Menambah & ubah data' },
                                        { key: 'delete', label: 'Delete', desc: 'Menghapus data' },
                                    ].map((item) => (
                                        <label
                                            key={item.key}
                                            className={`flex cursor-pointer flex-col rounded-xl border p-3 transition ${
                                                data.abilities.includes(item.key)
                                                    ? 'border-[#6D28D9] bg-violet-50/50 dark:bg-violet-950/30'
                                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={data.abilities.includes(item.key)}
                                                    onChange={() => toggleAbility(item.key)}
                                                    className="checkbox checkbox-xs checkbox-primary"
                                                />
                                            </div>
                                            <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.abilities && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.abilities}</p>
                                )}
                            </div>

                            <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCreating(false)}
                                    className="btn btn-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Batal
                                </button>
                                <SolidButton processing={processing}>
                                    Generate Token
                                </SolidButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tampilan Token Baru (Hanya Muncul Sekali) */}
            {displayToken && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="type-h3 text-slate-800 dark:text-slate-100">Token Berhasil Dibuat</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{displayToken.name}</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-300">
                            <span className="font-semibold">Perhatian Keamanan:</span> Token ini hanya ditampilkan satu kali demi keamanan. Salin dan simpan di pengelola kredensial yang aman sebelum menutup jendela ini.
                        </div>

                        <div className="mt-4">
                            <label className="type-small mb-1 block font-semibold text-slate-700 dark:text-slate-200">Token Akses API Anda</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={displayToken.plainTextToken}
                                    className="input input-sm flex-1 font-mono text-xs border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 select-all"
                                />
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
                                    className={`btn btn-sm shrink-0 ${
                                        copied
                                            ? 'bg-emerald-600 text-white'
                                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {copied ? (
                                        <>
                                            <svg className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Tersalin
                                        </>
                                    ) : (
                                        <>
                                            <svg className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            Salin
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setDisplayToken(null)}
                                className="btn btn-sm border-0 bg-[#1E1B4B] dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700"
                            >
                                Saya Sudah Menyimpan Token
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
