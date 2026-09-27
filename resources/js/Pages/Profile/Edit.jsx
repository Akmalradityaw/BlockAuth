import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import UpdateProfileForm from './Partials/UpdateProfileForm';
import AvatarForm from './Partials/AvatarForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import TwoFactorAuthentication from './Partials/TwoFactorAuthentication';
import PasskeyManager from './Partials/PasskeyManager';
import ApiTokenManager from './Partials/ApiTokenManager';
import ActiveSessions from './Partials/ActiveSessions';
import PrivacyAndDataManagement from './Partials/PrivacyAndDataManagement';

export default function Edit({ sessions = [], tokens = [], passkeys = [] }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <AppLayout
            eyebrow="Akun saya"
            title="Edit profil"
            desc="Kelola data diri, foto, kata sandi, autentikasi dua faktor, kredensial biometrik passkey, token API, sesi aktif perangkat, dan privasi akun Anda."
        >
            <Head title="Edit Profil" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                <div className="flex flex-col gap-6 lg:col-span-8">
                    <UpdateProfileForm user={user} />
                    <UpdatePasswordForm />
                    <TwoFactorAuthentication />
                    <PasskeyManager passkeys={passkeys} />
                    <ApiTokenManager tokens={tokens} />
                    <ActiveSessions sessions={sessions} />
                    <PrivacyAndDataManagement />
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
