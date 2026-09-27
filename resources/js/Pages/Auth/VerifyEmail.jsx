import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Alert from '@/Components/feedback/Alert';
import SolidButton from '@/Components/forms/SolidButton';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    function handleResend(e) {
        e.preventDefault();
        post('/email/verification-notification');
    }

    function handleLogout(e) {
        e.preventDefault();
        post('/logout');
    }

    return (
        <AuthLayout
            eyebrow="Keamanan Akun"
            title="Verifikasi Email Anda"
            subtitle="Terima kasih telah mendaftar di BlockAuth."
        >
            <Head title="Verifikasi Email" />

            {status === 'verification-link-sent' && (
                <div className="mb-4">
                    <Alert variant="success" title="Email Terkirim">
                        Tautan verifikasi baru telah dikirimkan ke alamat email yang Anda daftarkan.
                    </Alert>
                </div>
            )}

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Sebelum memulai, mohon verifikasi alamat email Anda dengan mengeklik tautan yang baru saja kami kirimkan ke kotak masuk email Anda. Jika Anda tidak menerima email tersebut, silakan minta tautan baru di bawah ini.
            </div>

            <form onSubmit={handleResend} className="mt-4 flex flex-col gap-3">
                <SolidButton processing={processing}>
                    Kirim Ulang Email Verifikasi
                </SolidButton>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                    <Link
                        href="/profile"
                        className="text-xs font-semibold text-[#6D28D9] dark:text-violet-400 hover:underline"
                    >
                        Edit Profil
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                        Keluar (Logout)
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
