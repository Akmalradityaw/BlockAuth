import { useEffect } from 'react';

export default function BaseModal({
    open,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'max-w-lg',
}) {
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape' && open) {
                onClose();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            <div
                className={`relative w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-xl transition-all`}
            >
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="type-h3 text-[#1E1B4B]">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm btn-ghost btn-circle text-slate-400 hover:text-slate-600"
                        aria-label="Tutup modal"
                    >
                        ✕
                    </button>
                </div>

                <div>{children}</div>

                {footer && (
                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

