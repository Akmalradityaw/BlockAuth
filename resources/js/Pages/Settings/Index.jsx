import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GeneralTab from './Partials/GeneralTab';
import ModulesTab from './Partials/ModulesTab';
import OAuthTab from './Partials/OAuthTab';
import SecurityPolicyTab from './Partials/SecurityPolicyTab';
import MailTab from './Partials/MailTab';

export default function SettingsIndex({
    general = {},
    oauth = {},
    security = {},
    features = {},
    app = {},
    mail = {},
}) {
    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'modules' | 'oauth' | 'security' | 'mail'

    const tabs = [
        { id: 'general', label: 'Umum & Siaran' },
        { id: 'modules', label: 'Tampilan & Modul' },
        { id: 'oauth', label: 'Integrasi OAuth & Login Sosial' },
        { id: 'security', label: 'Kebijakan Keamanan & Sandi' },
        { id: 'mail', label: 'Email & SMTP' },
    ];

    return (
        <AppLayout
            eyebrow="Sistem"
            title="Pengaturan Sistem"
            desc="Kelola mode pemeliharaan, siaran banner, kredensial OAuth, dan standar keamanan akun."
            actions={
                <Link
                    href="/roles/permissions"
                    className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-100"
                >
                    Buka Matriks Akses
                </Link>
            }
        >
            <Head title="Pengaturan Sistem" />

            {/* Navigasi Tab */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
                                    isActive
                                        ? 'border-[#6D28D9] text-[#6D28D9]'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Isi Konten Tab */}
            <div className="mt-6">
                {activeTab === 'general' && <GeneralTab general={general} />}
                {activeTab === 'modules' && <ModulesTab features={features} app={app} />}
                {activeTab === 'oauth' && <OAuthTab oauth={oauth} />}
                {activeTab === 'security' && <SecurityPolicyTab security={security} />}
                {activeTab === 'mail' && <MailTab mail={mail} />}
            </div>
        </AppLayout>
    );
}
