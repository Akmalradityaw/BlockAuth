import { useEffect, useState } from 'react';

/**
 * Dialog ala Swal.fire, custom tanpa dependensi.
 *
 *   import { fire } from '@/Components/feedback/Swal';
 *   const { isConfirmed } = await fire({
 *       title: 'Hapus pengguna',
 *       text: 'Hapus Budi secara permanen?',
 *       icon: 'warning',
 *       confirmText: 'Ya, hapus',
 *       showCancelButton: true,
 *   });
 *   if (isConfirmed) router.delete(`/users/${id}`);
 */

// ponytail: bridge on globalThis so Vite HMR re-execution reuses one Set
// instead of orphaning the mounted host (dialog only worked after refresh).
if (!globalThis.__baSwalBridge) {
    globalThis.__baSwalBridge = { listeners: new Set() };
}
const listeners = globalThis.__baSwalBridge.listeners;

export function fire({
    title,
    text,
    icon = 'info',
    confirmText = 'OK',
    cancelText = 'Batal',
    showCancelButton = false,
}) {
    return new Promise((resolve) => {
        listeners.forEach((fn) =>
            fn({ title, text, icon, confirmText, cancelText, showCancelButton, resolve })
        );
    });
}

const STYLES = {
    success: { badge: 'bg-emerald-100 text-emerald-700', accent: 'bg-emerald-500', glyph: '✓' },
    error: { badge: 'bg-red-100 text-red-700', accent: 'bg-red-500', glyph: '!' },
    warning: { badge: 'bg-amber-100 text-amber-700', accent: 'bg-[#F59E0B]', glyph: '!' },
    info: { badge: 'bg-[#EEF2FF] text-[#6D28D9]', accent: 'bg-[#6D28D9]', glyph: 'i' },
    question: { badge: 'bg-[#EEF2FF] text-[#6D28D9]', accent: 'bg-[#6D28D9]', glyph: '?' },
};

export default function SwalHost() {
    const [state, setState] = useState(null);

    useEffect(() => {
        function handler(payload) {
            setState((prev) => {
                // ponytail: single dialog only; new fire dismisses the old one.
                prev?.resolve({ isConfirmed: false, isDismissed: true });
                return payload;
            });
        }
        listeners.add(handler);
        return () => listeners.delete(handler);
    }, []);

    // Lock scroll
    useEffect(() => {
        if (state) document.body.classList.add('ba-locked');
        else document.body.classList.remove('ba-locked');
        return () => document.body.classList.remove('ba-locked');
    }, [state]);

    // ESC = dismiss
    useEffect(() => {
        if (!state) return;
        function onKey(e) {
            if (e.key === 'Escape') dismiss();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [state]);

    if (!state) return null;

    const style = STYLES[state.icon] || STYLES.info;

    function confirm() {
        state.resolve({ isConfirmed: true, isDismissed: false });
        setState(null);
    }

    function dismiss() {
        state.resolve({ isConfirmed: false, isDismissed: true });
        setState(null);
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="swal-title"
            onClick={dismiss}
        >
            <div
                className="ba-anim-in relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 px-6 pb-6 pt-8 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <span className={`absolute inset-x-0 top-0 h-1.5 ${style.accent}`} />

                <span
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-extrabold ${style.badge}`}
                >
                    {style.glyph}
                </span>

                <h3 id="swal-title" className="mt-4 text-lg font-bold text-[#1E1B4B] dark:text-slate-100">
                    {state.title}
                </h3>
                {state.text && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{state.text}</p>
                )}

                <div className={`mt-6 grid gap-2 ${state.showCancelButton ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {state.showCancelButton && (
                        <button
                            type="button"
                            onClick={dismiss}
                            className="btn border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1B4B] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            {state.cancelText}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={confirm}
                        autoFocus
                        className="btn border-0 bg-[#6D28D9] font-semibold text-white hover:bg-[#5B21B6]"
                    >
                        {state.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
