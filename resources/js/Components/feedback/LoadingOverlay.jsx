import { useEffect, useState } from 'react';

/**
 * Loading overlay terpusat gaya SweetAlert.
 *
 *   import { showLoading, hideLoading } from '@/Components/feedback/LoadingOverlay';
 *   showLoading('Menyimpan…');
 *   hideLoading();
 */
// ponytail: bridge on globalThis so Vite HMR re-execution reuses one Set
// instead of orphaning the mounted overlay.
if (!globalThis.__baLoadingBridge) {
    globalThis.__baLoadingBridge = { listeners: new Set() };
}
const listeners = globalThis.__baLoadingBridge.listeners;

export function showLoading(text = 'Memuat…') {
    listeners.forEach((fn) => fn({ active: true, text }));
}

export function hideLoading() {
    listeners.forEach((fn) => fn({ active: false, text: '' }));
}

export default function LoadingOverlay({ active, text = 'Memuat…' }) {
    const [state, setState] = useState({ active: !!active, text });

    useEffect(() => {
        if (active !== undefined) setState({ active: !!active, text });
    }, [active, text]);

    useEffect(() => {
        const fn = (payload) => setState(payload);
        listeners.add(fn);
        return () => listeners.delete(fn);
    }, []);

    // Lock scroll saat aktif
    useEffect(() => {
        if (state.active) document.body.classList.add('ba-locked');
        else document.body.classList.remove('ba-locked');
        return () => document.body.classList.remove('ba-locked');
    }, [state.active]);

    if (!state.active) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm">
            <div className="ba-anim-in relative w-full max-w-md overflow-hidden rounded-3xl bg-white px-6 pb-6 pt-8 text-center shadow-2xl">
                <span className="absolute inset-x-0 top-0 h-1.5 bg-[#F59E0B]" />

                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FF]">
                    <span className="ba-spinner ba-spinner-lg border-slate-200 border-t-[#6D28D9]" />
                </span>

                <p className="mt-4 text-lg font-bold text-[#1E1B4B]">{state.text}</p>
                <p className="mt-1 text-sm text-slate-500">Mohon tunggu sebentar…</p>
            </div>
        </div>
    );
}
