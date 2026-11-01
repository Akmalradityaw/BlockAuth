export default function ExportFormatCardGrid({ formats = [], selectedFormat, onSelectFormat }) {
    return (
        <div className="card-shell p-6">
            <h3 className="text-base font-bold text-[#1E1B4B]">Format Berkas Output</h3>
            <p className="mt-1 text-xs text-slate-500">Pilih salah satu dari 9 format berkas yang didukung.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {formats.map((fmt) => {
                    const isSelected = selectedFormat === fmt.id;
                    return (
                        <button
                            key={fmt.id}
                            type="button"
                            onClick={() => onSelectFormat(fmt.id)}
                            className={`flex flex-col text-left rounded-xl border p-3.5 transition-all ${
                                isSelected
                                    ? 'border-[#6D28D9] bg-indigo-50/40 ring-1 ring-[#6D28D9]'
                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-[#1E1B4B]">{fmt.name}</span>
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                                    isSelected ? 'bg-[#6D28D9] text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {fmt.badge}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{fmt.desc}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

