import AvatarUploader from '@/Components/AvatarUploader';

export default function AvatarForm({ user }) {
    return (
        <section className="card-shell p-4 sm:p-6">
            <h2 className="type-h2 text-[#1E1B4B]">Foto profil</h2>
            <p className="type-small mt-1 text-[#334155]">Avatar tampil bulat di navbar dan daftar pengguna.</p>
            <div className="mt-4">
                <AvatarUploader currentUrl={user.avatar_url} />
            </div>
        </section>
    );
}
