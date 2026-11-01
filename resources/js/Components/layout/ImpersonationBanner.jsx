import { router, usePage } from '@inertiajs/react';

export default function ImpersonationBanner() {
    const { auth } = usePage().props;

    if (!auth?.is_impersonating) {
        return null;
    }

    const targetUser = auth?.user?.name || 'Pengguna';
    const impersonator = auth?.impersonator?.name || 'SuperAdmin';

    function handleStop() {
        router.post('/impersonation/stop');
    }

    return (
        <aside
            aria-label="Pemberitahuan Sesi Impersonasi"
            className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-amber-300 bg-[#F59E0B] px-4 py-2.5 text-[#1E1B4B] shadow-sm sm:px-6"
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E1B4B] text-xs font-bold text-white">
                    !
                </span>
                <p className="type-small truncate font-semibold">
                    Mode Impersonasi Aktif: Anda sedang masuk sebagai <strong className="underline decoration-black/30 underline-offset-2">{targetUser}</strong> ({impersonator}).
                </p>
            </div>
            <button
                type="button"
                onClick={handleStop}
                className="btn btn-xs shrink-0 border-0 bg-[#1E1B4B] font-bold text-white hover:bg-[#151235]"
            >
                Kembali ke SuperAdmin
            </button>
        </aside>
    );
}

