import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatCard } from '@/Components/data/Ui';
import SolidButton from '@/Components/forms/SolidButton';
import { showToast } from '@/Components/feedback/Toast';

export default function EmailTemplatesIndex({ templates = [], stats = {} }) {
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0] || null);
    const [subject, setSubject] = useState(templates[0]?.subject || '');
    const [body, setBody] = useState(templates[0]?.body || '');
    const [previewMode, setPreviewMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    function selectTemplate(tmpl) {
        setSelectedTemplate(tmpl);
        setSubject(tmpl.subject);
        setBody(tmpl.body);
        setPreviewMode(false);
    }

    function handleSave(e) {
        e.preventDefault();
        if (!selectedTemplate) return;
        setSaving(true);

        router.put(`/settings/email-templates/${selectedTemplate.id}`, {
            subject,
            body,
        }, {
            preserveScroll: true,
            onSuccess: () => showToast(`Template '${selectedTemplate.name}' berhasil diperbarui.`, 'success'),
            onError: () => showToast('Gagal memperbarui template.', 'error'),
            onFinish: () => setSaving(false),
        });
    }

    function handleReset() {
        if (!selectedTemplate) return;
        if (!confirm(`Kembalikan template '${selectedTemplate.name}' ke setelan standar bawaan pabrik?`)) return;

        router.post(`/settings/email-templates/${selectedTemplate.id}/reset`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Template dikembalikan ke format standar.', 'info');
                // reload current template
                const refreshed = templates.find((t) => t.id === selectedTemplate.id);
                if (refreshed) {
                    setSubject(refreshed.subject);
                    setBody(refreshed.body);
                }
            },
            onError: () => showToast('Gagal mereset template.', 'error'),
        });
    }

    function handleSendTest() {
        if (!selectedTemplate) return;
        setTesting(true);

        router.post(`/settings/email-templates/${selectedTemplate.id}/test`, {}, {
            preserveScroll: true,
            onSuccess: () => showToast(`Simulasi email uji coba '${selectedTemplate.name}' berhasil dikirim.`, 'success'),
            onError: () => showToast('Gagal mengirimkan simulasi email.', 'error'),
            onFinish: () => setTesting(false),
        });
    }

    function insertVariable(varName) {
        setBody((prev) => prev + ` {{${varName}}}`);
        showToast(`Variabel {{${varName}}} disisipkan.`, 'info');
    }

    // Mock preview renderer dengan mengganti variabel dinamis
    function getRenderedPreview() {
        let content = body;
        const mockData = {
            user_name: 'Budi Santoso',
            action_url: 'https://blockauth.test/auth/verify?token=example_123',
            ip_address: '192.168.1.100',
            login_time: '27 Sep 2026, 01:45 WIB',
            device_name: 'Chrome on Windows 11',
            decay_minutes: '5',
        };

        Object.keys(mockData).forEach((key) => {
            content = content.replaceAll(`{{${key}}}`, mockData[key]);
        });

        return content;
    }

    return (
        <AppLayout
            eyebrow="Sistem"
            title="Manajemen Template Notifikasi Email"
            desc="Kustomisasi teks, subjek, dan variabel dinamis email transaksional resmi sistem untuk verifikasi akun, reset sandi, dan notifikasi keamanan."
        >
            <Head title="Manajemen Template Notifikasi Email" />

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Template"
                    value={stats.total ?? templates.length}
                    hint="Pesan sistem terdaftar"
                />
                <StatCard
                    label="Status Template"
                    value="Aktif"
                    hint="Terkirim otomatis"
                />
                <StatCard
                    label="Format Pengiriman"
                    value="Markdown & HTML"
                    hint="Dukungan variabel dinamis"
                />
                <StatCard
                    label="Protokol Email"
                    value="SMTP / Mail"
                    hint="Tersinkronisasi antrean"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Daftar Pilihan Template (Sisi Kiri) */}
                <div className="lg:col-span-4 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-3">
                        Pilih Template Notifikasi
                    </h3>
                    {templates.map((tmpl) => (
                        <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => selectTemplate(tmpl)}
                            className={`w-full text-left rounded-2xl border p-4 transition ${
                                selectedTemplate?.id === tmpl.id
                                    ? 'border-violet-500 bg-white shadow-md ring-2 ring-violet-500/20 dark:bg-slate-900 dark:border-violet-500'
                                    : 'border-slate-200/80 bg-white/70 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{tmpl.name}</span>
                                <span className="font-mono text-[10px] text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-1.5 py-0.5 rounded">
                                    {tmpl.code}
                                </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                Subjek: {tmpl.subject}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Editor & Preview Template (Sisi Kanan) */}
                <div className="lg:col-span-8">
                    {selectedTemplate ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                        {selectedTemplate.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Kode Event: <span className="font-mono font-semibold">{selectedTemplate.code}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode(!previewMode)}
                                        className="btn btn-sm btn-outline border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                    >
                                        {previewMode ? 'Buka Editor' : 'Pratinjau Live'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSendTest}
                                        disabled={testing}
                                        className="btn btn-sm btn-ghost text-violet-600 dark:text-violet-400"
                                    >
                                        {testing ? 'Mengirim...' : 'Kirim Tes Email'}
                                    </button>
                                </div>
                            </div>

                            {/* Daftar Variabel Dinamis */}
                            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                                    Variabel Dinamis yang Didukung (Klik untuk menyisipkan):
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedTemplate.variables?.map((v) => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => insertVariable(v)}
                                            className="font-mono text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-violet-700 dark:text-violet-300 hover:border-violet-400 transition"
                                        >
                                            {`{{${v}}}`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {previewMode ? (
                                /* Tampilan Live Preview */
                                <div className="mt-4 space-y-3">
                                    <div className="rounded-xl border border-slate-200 bg-slate-100/50 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-xs">
                                        <span className="font-semibold text-slate-500">Subjek Email:</span>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{subject}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-inner dark:border-slate-800 dark:bg-slate-950 font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
                                        {getRenderedPreview()}
                                    </div>
                                </div>
                            ) : (
                                /* Form Editor */
                                <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Subjek Email
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="input input-sm input-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Isi Konten Pesan Email
                                        </label>
                                        <textarea
                                            rows={10}
                                            required
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            className="textarea textarea-bordered w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs leading-relaxed"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="btn btn-sm btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                        >
                                            Pulihkan Format Bawaan Pabrik
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn btn-sm btn-brand border-0"
                                        >
                                            {saving ? 'Menyimpan...' : 'Simpan Perubahan Template'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                            <p className="text-xs text-slate-400">Pilih salah satu template email di sisi kiri untuk mulai menyunting.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
