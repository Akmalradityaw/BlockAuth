import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import BaseModal from '@/Components/ui/BaseModal';
import FormInput from '@/Components/ui/FormInput';
import SelectInput from '@/Components/ui/SelectInput';
import SolidButton from '@/Components/ui/SolidButton';
import { SUPPORTED_DRIVERS } from '@/lib/oauthProviders';

export default function OAuthProviderModal({ open, onClose, provider = null }) {
    const isEdit = Boolean(provider);
    const [showSecret, setShowSecret] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        provider_id: '',
        name: '',
        driver: 'google',
        client_id: '',
        client_secret: '',
        is_active: true,
    });

    useEffect(() => {
        if (open) {
            clearErrors();
            setShowSecret(false);
            if (provider) {
                setData({
                    provider_id: provider.id || '',
                    name: provider.name || '',
                    driver: provider.driver || 'google',
                    client_id: provider.client_id || '',
                    client_secret: '',
                    is_active: Boolean(provider.is_active),
                });
            } else {
                setData({
                    provider_id: '',
                    name: '',
                    driver: 'google',
                    client_id: '',
                    client_secret: '',
                    is_active: true,
                });
            }
        }
    }, [open, provider]);

    function handleSubmit(e) {
        e.preventDefault();
        if (isEdit) {
            put(`/settings/oauth/providers/${provider.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/settings/oauth/providers', {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    }

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title={isEdit ? `Edit Provider OAuth (${provider.name})` : 'Tambah Provider OAuth Baru'}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <SolidButton
                        type="submit"
                        form="oauth-provider-form"
                        processing={processing}
                        fullWidth={false}
                        variant="primary"
                        className="btn-sm"
                    >
                        {isEdit ? 'Simpan Perubahan' : 'Tambahkan Provider'}
                    </SolidButton>
                </>
            }
        >
            <form id="oauth-provider-form" onSubmit={handleSubmit} className="space-y-4">
                {!isEdit && (
                    <div>
                        <FormInput
                            label="ID Provider (Slug Unik)"
                            placeholder="misal: gitlab, google-org, slack"
                            value={data.provider_id}
                            onChange={(e) =>
                                setData('provider_id', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                            }
                            error={errors.provider_id}
                            required
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Digunakan sebagai pengenal URL callback: /oauth/[id]/callback
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormInput
                        label="Nama Tampilan"
                        placeholder="misal: GitLab Kantor"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        required
                    />
                    <SelectInput
                        label="Driver Socialite"
                        value={data.driver}
                        onChange={(e) => setData('driver', e.target.value)}
                        options={SUPPORTED_DRIVERS}
                        error={errors.driver}
                    />
                </div>

                <FormInput
                    label="Client ID / App ID"
                    placeholder="Salin Client ID dari konsol developer"
                    value={data.client_id}
                    onChange={(e) => setData('client_id', e.target.value)}
                    error={errors.client_id}
                    required
                />

                <div className="form-control w-full">
                    <label className="label pb-1">
                        <span className="type-small font-semibold text-[#1E1B4B]">Client Secret</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showSecret ? 'text' : 'password'}
                            placeholder={
                                isEdit && provider?.has_secret
                                    ? 'Kosongkan jika tidak ingin mengubah secret'
                                    : 'Salin Client Secret'
                            }
                            value={data.client_secret}
                            onChange={(e) => setData('client_secret', e.target.value)}
                            className={`input input-bordered input-brand w-full pr-14 bg-white text-base text-[#1E1B4B] ${
                                errors.client_secret ? 'border-red-500' : 'border-slate-300'
                            }`}
                            required={!isEdit && !provider?.has_secret}
                        />
                        <button
                            type="button"
                            onClick={() => setShowSecret((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-[#6D28D9]"
                            tabIndex={-1}
                        >
                            {showSecret ? 'Tutup' : 'Lihat'}
                        </button>
                    </div>
                    {errors.client_secret && (
                        <span className="type-small mt-1 text-[#B91C1C]">{errors.client_secret}</span>
                    )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="checkbox checkbox-sm checkbox-primary"
                        />
                        <div>
                            <span className="type-small block font-bold text-[#1E1B4B]">
                                Aktifkan Provider Ini
                            </span>
                            <span className="type-caption block text-slate-500">
                                Tombol login untuk provider ini akan langsung tampil di halaman Login & Register.
                            </span>
                        </div>
                    </label>
                </div>
            </form>
        </BaseModal>
    );
}
