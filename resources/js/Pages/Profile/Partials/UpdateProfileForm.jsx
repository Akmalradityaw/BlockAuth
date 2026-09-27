import { useForm } from '@inertiajs/react';
import FormInput from '@/Components/forms/FormInput';
import SolidButton from '@/Components/forms/SolidButton';

export default function UpdateProfileForm({ user }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
    });

    function submit(e) {
        e.preventDefault();
        patch('/profile');
    }

    return (
        <section className="card-shell p-4 sm:p-6">
            <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Data diri</h2>
            <p className="type-small mt-1 text-[#334155] dark:text-slate-400">Nama tampil di seluruh aplikasi. Email dipakai untuk login.</p>
            <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
                <FormInput
                    label="Nama lengkap"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    required
                />
                <FormInput
                    label="Email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />
                <div className="form-control">
                    <label className="label pb-1">
                        <span className="type-small font-semibold text-[#1E1B4B] dark:text-slate-200">Bio singkat</span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-base focus:border-[#6D28D9] focus:outline-none transition-colors"
                        rows="3"
                        maxLength="500"
                        placeholder="Ceritakan singkat tentang Anda (maks 500 karakter)"
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                    />
                    <span className="type-small mt-1 text-right text-[#334155] dark:text-slate-400">{data.bio.length}/500</span>
                    {errors.bio && <span className="type-small text-[#B91C1C] dark:text-rose-400">{errors.bio}</span>}
                </div>
                <SolidButton processing={processing}>Simpan profil</SolidButton>
            </form>
        </section>
    );
}
