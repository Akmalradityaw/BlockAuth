import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';
import SolidButton from '@/Components/ui/SolidButton';

export default function MagicLinkConfirm({ targetUser, consumeUrl }) {
    const [submitting, setSubmitting] = useState(false);

    function handleConfirm(e) {
        e.preventDefault();
        setSubmitting(true);
        router.post(consumeUrl, {}, {
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AuthLayout
            eyebrow="Autentikasi Terverifikasi"
            title="Konfirmasi Masuk Akun"
            subtitle="Tautan email Anda valid. Klik tombol di bawah untuk menyelesaikan proses masuk."
        >
            <Head title="Konfirmasi Magic Link" />

            <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="type-caption text-slate-500">Masuk sebagai:</p>
                    <p className="text-base font-bold text-[#1E1B4B]">{targetUser.name}</p>
                    <p className="type-small font-mono text-slate-600">{targetUser.email}</p>
                </div>

                <form onSubmit={handleConfirm}>
                    <SolidButton processing={submitting} variant="primary">
                        Masuk ke Dashboard Sekarang
                    </SolidButton>
                </form>

                <p className="type-caption text-center text-slate-400">
                    Mekanisme 2-tahap ini melindungi akun Anda dari pemindaian otomatis bot email.
                </p>
            </div>
        </AuthLayout>
    );
}

