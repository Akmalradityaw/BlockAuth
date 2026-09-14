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
            <h2 className="type-h2 text-[#1E1B4B]">Data diri</h2>
            <p className="type-small mt-1 text-[#334155]">Nama tampil di seluruh aplikasi. Email dipakai untuk login.</p>
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
                        <span className="type-small font-semibold text-[#1E1B4B]">Bio singkat</span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered w-full bg-white text-base"
                        rows="3"
                        maxLength="500"
                        placeholder="Ceritakan singkat tentang Anda (maks 500 karakter)"
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                    />
                    <span className="type-small mt-1 text-right text-[#334155]">{data.bio.length}/500</span>
                    {errors.bio && <span className="type-small text-[#B91C1C]">{errors.bio}</span>}
                </div>
                <SolidButton processing={processing}>Simpan profil</SolidButton>
            </form>
        </section>
    );
}
