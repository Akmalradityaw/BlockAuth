import { usePage } from '@inertiajs/react';

export default function Footer() {
    const { app = {} } = usePage().props;
    const footerText = app?.footer_text || `© ${new Date().getFullYear()} ${app?.name || 'BlockAuth'}. All rights reserved.`;

    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-4">
                <p className="text-sm text-slate-500">
                    {footerText}
                </p>
            </div>
        </footer>
    );
}
