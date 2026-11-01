export default function ExportColumnSelector({
    columns = [],
    selectedColumns = [],
    onToggleColumn,
    onSelectAll,
}) {
    return (
        <div className="card-shell p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-[#1E1B4B]">Kolom Data yang Disertakan</h3>
                    <p className="mt-1 text-xs text-slate-500">Centang kolom data yang ingin dimasukkan ke dalam berkas.</p>
                </div>
                <button
                    type="button"
                    onClick={onSelectAll}
                    className="btn btn-xs border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-50"
                >
                    Pilih Semua Kolom
                </button>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
                {columns.map((col) => {
                    const isChecked = selectedColumns.includes(col.id);

                    return (
                        <label
                            key={col.id}
                            className={`flex items-center gap-2.5 rounded-lg border p-2.5 cursor-pointer text-xs font-semibold ${
                                isChecked ? 'border-indigo-300 bg-indigo-50/50 text-[#1E1B4B]' : 'border-slate-200 bg-white text-slate-500'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => onToggleColumn(col.id)}
                                className="checkbox checkbox-xs checkbox-primary"
                            />
                            <span>{col.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

