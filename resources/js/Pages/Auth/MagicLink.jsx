import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Alert from '@/Components/feedback/Alert';
import FormInput from '@/Components/ui/FormInput';
import SolidButton from '@/Components/ui/SolidButton';

export default function MagicLink({ status }) {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/magic-link');
    }

    const message = status || flash?.status;

    return (
        <AuthLayout
            eyebrow="Masuk Tanpa Sandi"
            title="Kirim Magic Link"
            subtitle="Masukkan alamat email akun Anda. Kami akan mengirimkan tautan masuk instan sekali pakai ke inbox Anda."
        >
            <Head title="Magic Link" />

            {message && (
                <div className="mb-4">
                    <Alert variant="info">{message}</Alert>
                </div>
            )}

            {flash?.warning && (
                <div className="mb-4">
                    <Alert variant="warning">{flash.warning}</Alert>
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-3">
                <FormInput
                    label="Alamat Email Terdaftar"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@emailanda.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />

                <SolidButton processing={processing} variant="primary">
                    Kirim Tautan Masuk
                </SolidButton>

                <div className="mt-4 text-center">
                    <Link
                        href="/login"
                        className="type-small font-semibold text-[#6D28D9] hover:underline"
                    >
                        Ingin masuk dengan kata sandi biasa? Kembali ke Login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

