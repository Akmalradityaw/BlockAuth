import { useState } from 'react';
import { router } from '@inertiajs/react';
import useClipboard from '@/hooks/useClipboard';
import OAuthProviderModal from './OAuthProviderModal';

export default function OAuthTab({ oauth }) {
    const providers = oauth?.providers || [];
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const { isCopied, copy } = useClipboard();

    function handleAdd() {
        setSelectedProvider(null);
        setModalOpen(true);
    }

    function handleEdit(provider) {
        setSelectedProvider(provider);
        setModalOpen(true);
    }

    function handleToggle(id) {
        setTogglingId(id);
        router.patch(
            `/settings/oauth/providers/${id}/toggle`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            }
        );
    }

    function handleDelete(provider) {
        if (!window.confirm(`Hapus konfigurasi provider OAuth "${provider.name}" (${provider.id})? Pengguna tidak akan dapat masuk menggunakan akun ini lagi.`)) {
            return;
        }

        router.delete(`/settings/oauth/providers/${provider.id}`, {
            preserveScroll: true,
        });
    }

    function copyCallbackUrl(id) {
        const url = `${window.location.origin}/oauth/${id}/callback`;
        copy(url, id);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <h2 className="type-h2 text-[#1E1B4B]">Integrasi OAuth & Login Sosial</h2>
                    <p className="type-small mt-1 text-[#334155]">
                        Kelola penyedia identitas OAuth untuk memfasilitasi autentikasi pihak ketiga tanpa perlu menyentuh file .env.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="btn btn-sm shrink-0 border-0 bg-[#6D28D9] font-semibold text-white hover:bg-[#5b21b6]"
                >
                    + Tambah Provider
                </button>
            </div>

            {providers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white">
                    <p className="type-base font-semibold text-[#1E1B4B]">Belum ada provider OAuth</p>
                    <p className="type-small mt-1 text-slate-500">
                        Tambahkan Google, GitHub, GitLab, atau provider lainnya untuk mengaktifkan login sosial.
                    </p>
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="btn btn-sm mt-4 border-0 bg-[#6D28D9] text-white hover:bg-[#5b21b6]"
                    >
                        Tambah Provider Pertama
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {providers.map((p) => {
                        const callbackUrl = `${window.location.origin}/oauth/${p.id}/callback`;
                        const copied = isCopied(p.id);

                        return (
                            <div
                                key={p.id}
                                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="type-h3 text-[#1E1B4B]">{p.name}</h3>
                                                <span className="badge badge-sm border-0 bg-purple-100 text-xs font-semibold text-[#6D28D9]">
                                                    {p.driver}
                                                </span>
                                            </div>
                                            <p className="type-caption mt-0.5 text-slate-400">
                                                Slug: <code className="font-mono text-xs">{p.id}</code>
                                            </p>
                                        </div>

                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(p.is_active)}
                                                disabled={togglingId === p.id}
                                                onChange={() => handleToggle(p.id)}
                                                className="toggle toggle-primary toggle-sm"
                                            />
                                            <span className={`text-xs font-bold ${p.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {p.is_active ? 'Aktif' : 'Mati'}
                                            </span>
                                        </label>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <span className="type-caption block font-bold text-slate-500 uppercase tracking-wider">
                                                Client ID
                                            </span>
                                            <p className="type-small font-mono truncate text-[#1E1B4B]">
                                                {p.client_id || '(Belum disetel)'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="type-caption block font-bold text-slate-500 uppercase tracking-wider">
                                                Client Secret
                                            </span>
                                            <p className="type-small font-mono text-slate-600">
                                                {p.has_secret ? '•••••••••••••••• (Tersimpan & Terenkripsi)' : '(Kosong)'}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="type-caption font-bold text-slate-500 uppercase tracking-wider">
                                                    Authorized Callback URL
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => copyCallbackUrl(p.id)}
                                                    className="btn btn-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                                >
                                                    {copied ? 'Tersalin!' : 'Salin URL'}
                                                </button>
                                            </div>
                                            <p className="type-small mt-1 select-all font-mono break-all text-slate-600">
                                                {callbackUrl}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(p)}
                                        className="btn btn-xs border border-red-200 bg-white text-red-600 hover:bg-red-50"
                                    >
                                        Hapus
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(p)}
                                        className="btn btn-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                    >
                                        Edit Konfigurasi
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <OAuthProviderModal
                open={modalOpen}
                provider={selectedProvider}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
}
