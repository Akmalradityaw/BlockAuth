import { useCallback, useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

/**
 * Toast modal terpusat (center) gaya SweetAlert.
 *
 * Pemakaian manual:
 *   import { toast } from '@/Components/feedback/Toast';
 *   toast.success('Tersimpan!');
 *   toast.error('Gagal.');
 *   toast.info('Info.');
 *   toast.loading('Memuat…');
 *
 * Flash session Laravel dan validation errors otomatis muncul.
 */

// ponytail: bridge on globalThis so Vite HMR re-execution reuses one Set
// instead of orphaning the mounted subscriber (toast only worked after refresh).
if (!globalThis.__baToastBridge) {
    globalThis.__baToastBridge = { listeners: new Set(), counter: 0 };
}
const listeners = globalThis.__baToastBridge.listeners;

function nextId() {
    return ++globalThis.__baToastBridge.counter;
}

function emit(payload) {
    listeners.forEach((fn) => fn(payload));
}

export const toast = {
    success: (msg, opts = {}) => emit({ type: 'success', msg, duration: opts.duration ?? 2600 }),
    error: (msg, opts = {}) => emit({ type: 'error', msg, duration: opts.duration ?? 3200 }),
    info: (msg, opts = {}) => emit({ type: 'info', msg, duration: opts.duration ?? 2400 }),
    loading: (msg = 'Memuat…') => emit({ type: 'loading', msg, duration: 0 }),
    dismiss: (id) => emit({ type: 'dismiss', id }),
};

const THEME = {
    success: {
        badge: 'bg-emerald-100 text-emerald-700',
        ring: 'ring-emerald-200',
        glyph: '✓',
        accent: 'bg-emerald-500',
    },
    error: {
        badge: 'bg-red-100 text-red-700',
        ring: 'ring-red-200',
        glyph: '!',
        accent: 'bg-red-500',
    },
    info: {
        badge: 'bg-[#EEF2FF] text-[#6D28D9]',
        ring: 'ring-[#6D28D9]/20',
        glyph: 'i',
        accent: 'bg-[#6D28D9]',
    },
    loading: {
        badge: 'bg-[#EEF2FF] text-[#6D28D9]',
        ring: 'ring-[#6D28D9]/20',
        glyph: null,
        accent: 'bg-[#F59E0B]',
    },
};

export default function Toast() {
    const { flash, errors } = usePage().props;
    const [items, setItems] = useState([]);
    const timers = useRef({});
    const latest = useRef(null);
    latest.current = { flash, errors };
    // ponytail: dedup pesan identik <1.5 detik (mount+event, HMR remount, klik ganda);
    // naikkan jendela bila ada pesan legit berulang cepat.
    // Disimpan di globalThis (bukan ref) agar berlaku lintas remount/instance.
    // ponytail: lastShown global per tab; reset otomatis tiap reload halaman penuh.
    if (!globalThis.__baToastDedup) {
        globalThis.__baToastDedup = { msg: null, at: 0 };
    }

    const remove = useCallback((id) => {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
        setItems((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
        setTimeout(() => {
            setItems((prev) => prev.filter((t) => t.id !== id));
        }, 200);
    }, []);

    const push = useCallback(
        (payload) => {
            if (payload.type === 'dismiss') {
                remove(payload.id);
                return;
            }
            const now = Date.now();
            const seen = globalThis.__baToastDedup;
            if (payload.type !== 'loading'
                && payload.msg === seen.msg
                && now - seen.at < 1500) {
                return;
            }
            seen.msg = payload.msg;
            seen.at = now;
            const id = nextId();
            setItems((prev) => [...prev, { id, ...payload }]);
            if (payload.duration > 0) {
                timers.current[id] = setTimeout(() => remove(id), payload.duration);
            }
        },
        [remove]
    );

    useEffect(() => {
        listeners.add(push);
        return () => listeners.delete(push);
    }, [push]);

    // Flash dan error dari setiap respons (pesan sama pun tampil lagi,
    // karena pemicu per event bukan per perubahan nilai).
    useEffect(() => {
        const show = (event) => {
            const props = event?.detail?.page?.props || latest.current || {};
            const first = Object.values(props.errors || {})[0];
            if (first) toast.error(first);
            else if (props.flash?.success) toast.success(props.flash.success);
            else if (props.flash?.status) toast.success(props.flash.status);
            else if (props.flash?.error) toast.error(props.flash.error);
            else if (props.flash?.info) toast.info(props.flash.info);
        };
        show();
        const offs = [router.on('success', show), router.on('error', show)];
        return () => offs.forEach((off) => off());
    }, []);

    if (items.length === 0) return null;

    return (
        <div
            className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center p-4"
            aria-live="polite"
        >
            {/* Overlay gelap + blur */}
            <div className="absolute inset-0 bg-[#1E1B4B]/50 backdrop-blur-sm" />

            <div className="relative flex w-full max-w-md flex-col gap-3">
                {items.map((t) => {
                    const theme = THEME[t.type] || THEME.info;
                    const isLoading = t.type === 'loading';

                    return (
                        <div
                            key={t.id}
                            role="alertdialog"
                            aria-modal="true"
                            className={`pointer-events-auto relative w-full overflow-hidden rounded-3xl bg-white px-6 pb-6 pt-8 text-center shadow-2xl ring-1 ${theme.ring} ${t.leaving ? 'ba-anim-out' : 'ba-anim-in'
                                }`}
                        >
                            {/* Aksen garis atas */}
                            <span className={`absolute inset-x-0 top-0 h-1.5 ${theme.accent}`} />

                            {/* Badge ikon besar */}
                            <span
                                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-extrabold ${theme.badge}`}
                            >
                                {isLoading ? (
                                    <span className="ba-spinner ba-spinner-lg border-slate-200 border-t-[#6D28D9]" />
                                ) : (
                                    theme.glyph
                                )}
                            </span>

                            {/* Pesan */}
                            <p className="mt-4 text-base font-semibold leading-snug text-[#1E1B4B]">
                                {t.msg}
                            </p>

                            {/* Tombol OK untuk tipe non-loading */}
                            {!isLoading && (
                                <button
                                    type="button"
                                    onClick={() => remove(t.id)}
                                    className="btn mt-6 w-full border-0 bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
                                >
                                    OK
                                </button>
                            )}

                            {isLoading && (
                                <p className="mt-2 text-xs font-medium text-slate-500">
                                    Mohon tunggu…
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
