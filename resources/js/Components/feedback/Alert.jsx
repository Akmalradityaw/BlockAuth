const VARIANTS = {
    info: { wrap: 'border-[#6D28D9]/25 bg-[#EEF2FF] text-[#1E1B4B]', icon: 'bg-[#6D28D9] text-white', glyph: 'i' },
    success: { wrap: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: 'bg-emerald-500 text-white', glyph: '✓' },
    warning: { wrap: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'bg-[#F59E0B] text-[#1E1B4B]', glyph: '!' },
    error: { wrap: 'border-red-200 bg-red-50 text-red-900', icon: 'bg-red-600 text-white', glyph: '!' },
};

export default function Alert({ variant = 'info', title, children, onClose, className = '' }) {
    const v = VARIANTS[variant] || VARIANTS.info;

    return (
        <div
            role="alert"
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${v.wrap} ${className}`}
        >
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${v.icon}`}>
                {v.glyph}
            </span>
            <div className="min-w-0 flex-1">
                {title && <p className="font-semibold">{title}</p>}
                {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup"
                    className="shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
