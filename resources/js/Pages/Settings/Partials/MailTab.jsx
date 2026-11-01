import { useState } from 'react';
import { router } from '@inertiajs/react';
import FormInput from '@/Components/ui/FormInput';
import SelectInput from '@/Components/ui/SelectInput';
import SolidButton from '@/Components/ui/SolidButton';
import { toast } from '@/Components/feedback/Toast';

export default function MailTab({ mail = {} }) {
    const [data, setData] = useState({
        host: mail.host || '',
        port: mail.port || 587,
        encryption: mail.encryption || 'tls',
        username: mail.username || '',
        password: '',
        from_address: mail.from_address || '',
        from_name: mail.from_name || '',
    });

    const [saving, setSaving] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testing, setTesting] = useState(false);

    function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        router.put('/settings/mail', data, {
            preserveScroll: true,
            onSuccess: () => toast.success('Konfigurasi server email SMTP berhasil disimpan.'),
            onError: () => toast.error('Gagal menyimpan konfigurasi server email.'),
            onFinish: () => setSaving(false),
        });
    }

    function handleSendTest(e) {
        e.preventDefault();
        if (!testEmail) {
            toast.error('Masukkan alamat email tujuan untuk uji kirim.');
            return;
        }

        setTesting(true);
        router.post(
            '/settings/mail/test',
            { email: testEmail },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Email percobaan berhasil dikirim.'),
                onError: () => toast.error('Gagal mengirim email percobaan.'),
                onFinish: () => setTesting(false),
            }
        );
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSave} className="card-shell p-4 sm:p-6 space-y-4">
                <div className="border-b border-slate-200 pb-4">
                    <h2 className="type-h2 font-bold text-[#1E1B4B]">Konfigurasi Server Email (SMTP)</h2>
                    <p className="type-small mt-1 text-[#334155]">
                        Koneksikan server SMTP untuk pengiriman tautan Magic Link, verifikasi email, dan notifikasi keamanan langsung dari UI.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                        <FormInput
                            label="SMTP Host"
                            placeholder="misal: smtp.mailgun.org atau smtp.gmail.com"
                            value={data.host}
                            onChange={(e) => setData({ ...data, host: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <FormInput
                            label="SMTP Port"
                            type="number"
                            placeholder="587"
                            value={data.port}
                            onChange={(e) => setData({ ...data, port: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <SelectInput
                            label="Enkripsi"
                            value={data.encryption}
                            onChange={(e) => setData({ ...data, encryption: e.target.value })}
                            options={[
                                { value: 'tls', label: 'TLS (Direkomendasikan)' },
                                { value: 'ssl', label: 'SSL' },
                                { value: 'none', label: 'Tanpa Enkripsi' },
                            ]}
                        />
                    </div>
                    <div>
                        <FormInput
                            label="SMTP Username"
                            placeholder="Username atau API key"
                            value={data.username}
                            onChange={(e) => setData({ ...data, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <FormInput
                            label="SMTP Password"
                            type="password"
                            placeholder={mail.has_password ? '•••••••• (Tersimpan)' : 'Kata sandi SMTP'}
                            value={data.password}
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                        label="Alamat Email Pengirim (From Address)"
                        type="email"
                        placeholder="no-reply@domainanda.com"
                        value={data.from_address}
                        onChange={(e) => setData({ ...data, from_address: e.target.value })}
                        required
                    />
                    <FormInput
                        label="Nama Pengirim (From Name)"
                        placeholder="BlockAuth System"
                        value={data.from_name}
                        onChange={(e) => setData({ ...data, from_name: e.target.value })}
                        required
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <SolidButton
                        type="submit"
                        processing={saving}
                        fullWidth={false}
                        variant="primary"
                        className="btn-sm"
                    >
                        Simpan Konfigurasi SMTP
                    </SolidButton>
                </div>
            </form>

            <section className="card-shell p-4 sm:p-6">
                <div className="border-b border-slate-200 pb-3">
                    <h3 className="type-h3 text-[#1E1B4B]">Uji Coba Pengiriman Email</h3>
                    <p className="type-small mt-0.5 text-[#334155]">
                        Kirimkan email uji coba ke alamat Anda untuk memastikan koneksi ke server SMTP berjalan lancar.
                    </p>
                </div>

                <form onSubmit={handleSendTest} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <FormInput
                            label="Kirim Email Percobaan Ke:"
                            type="email"
                            placeholder="nama@emailanda.com"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            required
                        />
                    </div>
                    <SolidButton
                        type="submit"
                        processing={testing}
                        fullWidth={false}
                        variant="amber"
                        className="btn-sm shrink-0"
                    >
                        Kirim Email Tes
                    </SolidButton>
                </form>
            </section>
        </div>
    );
}

