import BaseModal from '@/Components/ui/BaseModal';

export default function AuditPayloadModal({ log, onClose }) {
    if (!log) return null;

    return (
        <BaseModal
            open={Boolean(log)}
            onClose={onClose}
            title={
                <div>
                    <h3 className="text-base font-bold text-[#1E1B4B]">Detail Metadata Log</h3>
                    <p className="font-mono text-xs text-[#6D28D9]">{log.action}</p>
                </div>
            }
            footer={
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-sm border-0 bg-[#6D28D9] font-semibold text-white hover:bg-[#5b21b6]"
                >
                    Tutup
                </button>
            }
        >
            <div className="space-y-3">
                <div>
                    <p className="text-xs font-semibold text-[#334155]">Aktivitas:</p>
                    <p className="text-sm text-[#1E1B4B]">{log.description}</p>
                </div>

                <div>
                    <p className="text-xs font-semibold text-[#334155]">Data Parameter (JSON):</p>
                    <pre className="mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-emerald-400">
                        {JSON.stringify(log.properties, null, 2)}
                    </pre>
                </div>
            </div>
        </BaseModal>
    );
}

