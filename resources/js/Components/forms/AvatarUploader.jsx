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
                <div className="h-24 w-24 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#EEF2FF] dark:bg-slate-800 sm:h-28 sm:w-28 overflow-hidden">
                    {preview ? (
                        <img src={preview} alt="Avatar" className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                        <div className="type-small flex h-full w-full items-center justify-center text-[#334155] dark:text-slate-400">
                            Tanpa foto
                        </div>
                    )}
                </div>
            </div>
            <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPick}
                className="file-input file-input-bordered file-input-sm w-full max-w-xs bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors"
            />
            {errors.avatar && <span className="type-small text-[#B91C1C] dark:text-rose-400">{errors.avatar}</span>}
            <p className="type-small text-[#334155] dark:text-slate-400">JPG, PNG, atau WEBP. Maks 2MB. Resize otomatis 300x300.</p>
            <SolidButton processing={processing}>Unggah Avatar</SolidButton>
        </form>
    );
}
