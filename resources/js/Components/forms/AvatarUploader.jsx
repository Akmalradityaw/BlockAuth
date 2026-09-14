import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import SolidButton from '@/Components/forms/SolidButton';
import { hideLoading, showLoading } from '@/Components/feedback/LoadingOverlay';

export default function AvatarUploader({ currentUrl }) {
    const [preview, setPreview] = useState(currentUrl || null);
    const { setData, post, processing, errors } = useForm({ avatar: null });

    function onPick(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('avatar', file);
        setPreview(URL.createObjectURL(file));
    }

    function onSubmit(e) {
        e.preventDefault();
        showLoading('Mengunggah avatar...');
        post('/profile/avatar', {
            forceFormData: true,
            onFinish: () => hideLoading(),
        });
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col items-center gap-3 text-center">
            <div className="avatar">
                <div className="h-24 w-24 rounded-2xl border border-slate-200 bg-[#EEF2FF] sm:h-28 sm:w-28">
                    {preview ? (
                        <img src={preview} alt="Avatar" className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                        <div className="type-small flex h-full w-full items-center justify-center text-[#334155]">
                            Tanpa foto
                        </div>
                    )}
                </div>
            </div>
            <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPick}
                className="file-input file-input-bordered file-input-sm w-full max-w-xs"
            />
            {errors.avatar && <span className="type-small text-[#B91C1C]">{errors.avatar}</span>}
            <p className="type-small text-[#334155]">JPG, PNG, atau WEBP. Maks 2MB. Resize otomatis 300x300.</p>
            <SolidButton processing={processing}>Unggah Avatar</SolidButton>
        </form>
    );
}
