import BaseModal from '@/Components/ui/BaseModal';
import useClipboard from '@/hooks/useClipboard';

export default function RecoveryCodesModal({ codes, onClose }) {
    const { isCopied, copy } = useClipboard();

    if (!codes || codes.length === 0) {
        return null;
    }

    function handleCopy() {
        copy(codes.join('\n'), 'codes');
    }

    return (
        <BaseModal
            open={Boolean(codes && codes.length > 0)}
            onClose={onClose}
            maxWidth="max-w-md"
            title={
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </span>
                    <span className="text-base font-bold text-[#1E1B4B]">
                        Kode Pemulihan Darurat (2FA)
                    </span>
                </div>
            }
            footer={
                <>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="btn btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    >
                        {isCopied('codes') ? 'Tersalin ke Clipboard' : 'Salin Semua Kode'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm border-0 bg-[#6D28D9] font-semibold text-white hover:bg-[#5b21b6]"
                    >
                        Selesai
                    </button>
                </>
            }
        >
            <p className="text-sm text-[#334155]">
                Simpan kode ini di tempat yang aman. Setiap kode hanya dapat digunakan <strong>sekali</strong> jika Anda kehilangan akses ke aplikasi authenticator.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs font-semibold text-[#1E1B4B]">
                {codes.map((code, idx) => (
                    <div key={idx} className="rounded bg-white p-1.5 text-center tracking-widest shadow-sm">
                        {code}
                    </div>
                ))}
            </div>
        </BaseModal>
    );
}
