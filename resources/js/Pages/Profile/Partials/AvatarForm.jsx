import AvatarUploader from '@/Components/forms/AvatarUploader';

export default function AvatarForm({ user }) {
    return (
        <section className="card-shell p-4 sm:p-6">
            <h2 className="type-h2 text-[#1E1B4B] dark:text-slate-100">Foto profil</h2>
            <p className="type-small mt-1 text-[#334155] dark:text-slate-400">Avatar tampil bulat di navbar dan daftar pengguna.</p>
            <div className="mt-4">
                <AvatarUploader currentUrl={user.avatar_url} />
            </div>
        </section>
    );
}
