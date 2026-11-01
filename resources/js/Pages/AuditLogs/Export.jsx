import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import SolidButton from '@/Components/ui/SolidButton';

export default function AuditLogExport({
    actionOptions = [],
    stats = {},
    filters = {},
}) {
    const [selectedFormat, setSelectedFormat] = useState('csv');
    const [action, setAction] = useState(filters.action || '');
    const [search, setSearch] = useState(filters.search || '');

    const allColumns = [
        { id: 'id', label: 'ID Log' },
        { id: 'action', label: 'Tipe Aksi' },
        { id: 'description', label: 'Deskripsi Aktivitas' },
        { id: 'actor_name', label: 'Nama Aktor' },
        { id: 'actor_email', label: 'Email Aktor' },
        { id: 'ip_address', label: 'Alamat IP' },
        { id: 'user_agent', label: 'User Agent' },
        { id: 'created_at', label: 'Waktu Kejadian' },
    ];

    const [selectedColumns, setSelectedColumns] = useState(allColumns.map((c) => c.id));

    const formats = [
        { id: 'csv', name: 'CSV Spreadsheet', ext: '.csv', desc: 'Arsip terpisah koma untuk pembacaan cepat di spreadsheet.' },
        { id: 'xlsx', name: 'Microsoft Excel', ext: '.xlsx', desc: 'Format tabel Microsoft Excel untuk analisis audit kepatuhan.' },
        { id: 'pdf', name: 'Dokumen PDF', ext: '.pdf', desc: 'Laporan formal cetak log audit dengan kop BlockAuth.' },
        { id: 'docx', name: 'Microsoft Word', ext: '.docx', desc: 'Dokumen Word untuk lampiran audit yang dapat disunting.' },
        { id: 'json', name: 'Format Objek JSON', ext: '.json', desc: 'Data terstruktur JSON untuk sistem SIEM dan log aggregator.' },
        { id: 'sql', name: 'Skrip SQL INSERT', ext: '.sql', desc: 'Pernyataan INSERT INTO audit_logs untuk cold archiving.' },
        { id: 'md', name: 'Tabel Markdown', ext: '.md', desc: 'Dokumentasi kepatuhan untuk repositori Git dan wiki.' },
        { id: 'html', name: 'Halaman Web HTML', ext: '.html', desc: 'Halaman web mandiri siap cetak di peramban.' },
        { id: 'txt', name: 'Teks Polos TSV', ext: '.txt', desc: 'Log tab-separated untuk sistem analisis CLI dan terminal.' },
    ];

    function toggleColumn(colId) {
        if (selectedColumns.includes(colId)) {
            if (selectedColumns.length > 1) {
                setSelectedColumns(selectedColumns.filter((c) => c !== colId));
            }
        } else {
            setSelectedColumns([...selectedColumns, colId]);
        }
    }

    function handleSelectAllColumns() {
        setSelectedColumns(allColumns.map((c) => c.id));
    }

    function handleDownload() {
        const params = new URLSearchParams();
        params.set('format', selectedFormat);
        params.set('columns', selectedColumns.join(','));

        if (action) params.set('action', action);
        if (search) params.set('search', search);

        window.location.href = `/audit-logs/export/download?${params.toString()}`;
    }

    return (
        <AppLayout
            eyebrow="Audit & Kepatuhan"
            title="Ekspor Log Aktivitas"
            desc="Pilih format berkas, tentukan kolom, dan unduh riwayat log audit sistem."
            actions={
                <Link
                    href="/audit-logs"
                    className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-50"
                >
                    Kembali ke Log Aktivitas
                </Link>
            }
        >
            <Head title="Ekspor Log Aktivitas" />

            <div className="space-y-6">
                {/* 1. Pilih Format Berkas */}
                <div className="card-shell p-6">
                    <h3 className="text-base font-bold text-[#1E1B4B]">1. Pilih Format Berkas</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Pilih satu dari 9 format berkas yang didukung.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {formats.map((fmt) => {
                            const isSelected = selectedFormat === fmt.id;
                            return (
                                <button
                                    key={fmt.id}
                                    type="button"
                                    onClick={() => setSelectedFormat(fmt.id)}
                                    className={`flex flex-col text-left rounded-xl border p-4 transition-all ${
                                        isSelected
                                            ? 'border-[#6D28D9] bg-indigo-50/40 ring-1 ring-[#6D28D9]'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-[#1E1B4B]">{fmt.name}</span>
                                        <span className={`rounded px-1.5 py-0.5 text-[11px] font-mono font-bold ${
                                            isSelected ? 'bg-[#6D28D9] text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {fmt.ext}
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{fmt.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Pilih Kolom Data yang Disertakan */}
                <div className="card-shell p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-[#1E1B4B]">2. Kolom yang Disertakan</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Centang kolom log audit yang ingin Anda sertakan di dalam berkas output.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleSelectAllColumns}
                            className="btn btn-xs border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-50"
                        >
                            Pilih Semua Kolom
                        </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {allColumns.map((col) => {
                            const isChecked = selectedColumns.includes(col.id);
                            return (
                                <label
                                    key={col.id}
                                    className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer text-xs font-semibold transition-colors ${
                                        isChecked
                                            ? 'border-indigo-300 bg-indigo-50/50 text-[#1E1B4B]'
                                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleColumn(col.id)}
                                        className="checkbox checkbox-xs checkbox-primary"
                                    />
                                    <span>{col.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Filter Data */}
                <div className="card-shell p-6">
                    <h3 className="text-base font-bold text-[#1E1B4B]">3. Kriteria & Filter Log</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Batasi baris log audit yang diekspor berdasarkan tipe aksi atau kata kunci pencarian.
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Saring Berdasarkan Tipe Aksi
                            </label>
                            <select
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="select select-bordered select-sm w-full bg-white text-[#1E1B4B]"
                            >
                                <option value="">Semua Tipe Aksi ({stats.total || 0} Total Log)</option>
                                {actionOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Kata Kunci Pencarian (Opsional)
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari deskripsi, IP, atau nama aktor..."
                                className="input input-bordered input-sm w-full bg-white text-[#1E1B4B]"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Ringkasan & Tombol Unduh */}
                <div className="card-shell p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-[#1E1B4B]">
                            Format Output: <span className="uppercase text-[#6D28D9]">{selectedFormat}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Menyertakan {selectedColumns.length} kolom data. Berkas akan langsung diunduh ke perangkat Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/audit-logs"
                            className="btn btn-sm border border-slate-300 bg-white text-[#334155] hover:bg-slate-100"
                        >
                            Batal
                        </Link>
                        <SolidButton
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleDownload}
                        >
                            Unduh Berkas Log
                        </SolidButton>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

