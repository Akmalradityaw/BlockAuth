import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import UpdateProfileForm from './Partials/UpdateProfileForm';
import AvatarForm from './Partials/AvatarForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import TwoFactorAuthentication from './Partials/TwoFactorAuthentication';
import ActiveSessions from './Partials/ActiveSessions';
import DeleteUserForm from './Partials/DeleteUserForm';

export default function Edit({ sessions = [] }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <AppLayout
            eyebrow="Akun saya"
            title="Edit profil"
            desc="Kelola data diri, keamanan kata sandi, 2FA, sesi perangkat, dan status akun."
        >
            <Head title="Edit Profil" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                <div className="flex flex-col gap-6 lg:col-span-8">
                    <UpdateProfileForm user={user} />
                    <UpdatePasswordForm />
                    <TwoFactorAuthentication />
                    <ActiveSessions sessions={sessions} />
                    <DeleteUserForm />
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
