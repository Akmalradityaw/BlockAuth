import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import UpdateProfileForm from './Partials/UpdateProfileForm';
import AvatarForm from './Partials/AvatarForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';

export default function Edit() {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <AppLayout
            eyebrow="Akun saya"
            title="Edit profil"
            desc="Kelola data diri, foto, dan password dalam satu halaman responsif."
        >
            <Head title="Edit Profil" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                <div className="flex flex-col gap-4 lg:col-span-8">
                    <UpdateProfileForm user={user} />
                    <UpdatePasswordForm />
                </div>
                <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-20">
                        <AvatarForm user={user} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
