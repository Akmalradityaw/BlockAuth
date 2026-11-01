import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import SolidButton from '@/Components/ui/SolidButton';

export default function UserExport({
    availableRoles = [],
    stats = {},
    filters = {},
    selectedIds = [],
}) {
    const [selectedFormat, setSelectedFormat] = useState('csv');
    const [role, setRole] = useState(filters.role || '');
    const [status, setStatus] = useState(filters.status || '');
    const [search, setSearch] = useState(filters.search || '');

    const allColumns = [
        { id: 'id', label: 'ID Pengguna' },
        { id: 'name', label: 'Nama Lengkap' },
        { id: 'email', label: 'Alamat Email' },
        { id: 'role', label: 'Peran Akun' },
        { id: 'status', label: 'Status Verifikasi' },
        { id: 'bio', label: 'Biodata' },
        { id: 'created_at', label: 'Tanggal Bergabung' },
    ];

    const [selectedColumns, setSelectedColumns] = useState(allColumns.map((c) => c.id));

    const formats = [
        { id: 'csv', name: 'CSV Spreadsheet', ext: '.csv', desc: 'Kompatibel dengan Excel dan sistem pelaporan kantor.' },
        { id: 'xlsx', name: 'Microsoft Excel', ext: '.xlsx', desc: 'Format lembar sebar native OpenXML spreadsheet.' },
        { id: 'pdf', name: 'Dokumen PDF', ext: '.pdf', desc: 'Laporan formal siap cetak dengan batas aman 2.500 baris.' },
        { id: 'docx', name: 'Microsoft Word', ext: '.docx', desc: 'Dokumen laporan tabel yang dapat disunting di MS Word.' },
        { id: 'json', name: 'Format Objek JSON', ext: '.json', desc: 'Struktur data standar pertukaran sistem dan REST API.' },
        { id: 'sql', name: 'Skrip SQL INSERT', ext: '.sql', desc: 'Perintah INSERT INTO tabel users siap migrasi database.' },
        { id: 'md', name: 'Tabel Markdown', ext: '.md', desc: 'Format tabel teks GitHub, Notion, dan dokumentasi tim.' },
        { id: 'html', name: 'Halaman Web HTML', ext: '.html', desc: 'Tabel web standalone dengan palet tema resmi BlockAuth.' },
        { id: 'txt', name: 'Teks Polos TSV', ext: '.txt', desc: 'Format teks pisah-tab untuk sistem legacy dan terminal.' },
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

        if (selectedIds.length > 0) {
            params.set('ids', selectedIds.join(','));
        } else {
            if (role) params.set('role', role);
            if (status) params.set('status', status);
            if (search) params.set('search', search);
        }

        window.location.href = `/users/export/download?${params.toString()}`;
    }

    return (
        <AppLayout
            eyebrow="Direktori"
            title="Ekspor Data Pengguna"
            desc="Pilih format berkas, tentukan kolom yang disertakan, dan sesuaikan kriteria sebelum mengunduh data."
            actions={
                <Link
                    href="/users"
                    className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-50"
                >
                    Kembali ke Daftar Pengguna
                </Link>
            }
        >
            <Head title="Ekspor Data Pengguna" />

            <div className="space-y-6">
                {/* Informasi Pengguna Terpilih jika datang dari Bulk Action */}
                {selectedIds.length > 0 && (
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-sm text-[#1E1B4B] flex items-center justify-between">
                        <div>
                            <span className="font-bold">Mode Ekspor Spesifik:</span> Anda memilih{' '}
                            <span className="badge badge-sm border-0 bg-[#6D28D9] text-white font-bold mx-1">
                                {selectedIds.length} Pengguna
                            </span>{' '}
                            dari tabel direktori. Hanya pengguna yang dipilih ini yang akan dimasukkan ke dalam berkas.
                        </div>
                        <Link href="/users/export" className="text-xs text-[#6D28D9] font-semibold underline">
                            Ekspor Seluruh Pengguna Saja
                        </Link>
                    </div>
                )}

                {/* 1. Pilih Format Berkas */}
                <div className="card-shell p-6">
                    <h3 className="text-base font-bold text-[#1E1B4B]">1. Pilih Format Berkas</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Tersedia 9 pilihan format output yang dioptimasi untuk kebutuhan pelaporan, integrasi sistem, dan arsip.
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
                                Centang kolom yang ingin Anda sertakan di dalam berkas output.
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

                {/* 3. Filter Data (Jika tidak ada IDs spesifik yang dipilih) */}
                {selectedIds.length === 0 && (
                    <div className="card-shell p-6">
                        <h3 className="text-base font-bold text-[#1E1B4B]">3. Saring Cakupan Pengguna</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Batasi pengguna yang diekspor berdasarkan peran, status verifikasi, atau pencarian.
                        </p>

                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Saring Berdasarkan Peran
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="select select-bordered select-sm w-full bg-white text-[#1E1B4B]"
                                >
                                    <option value="">Semua Peran ({stats.total || 0} Pengguna)</option>
                                    {availableRoles.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Status Verifikasi Email
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="select select-bordered select-sm w-full bg-white text-[#1E1B4B]"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="verified">Hanya Terverifikasi ({stats.verified || 0})</option>
                                    <option value="unverified">Belum Verifikasi ({stats.unverified || 0})</option>
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
                                    placeholder="Cari nama atau email..."
                                    className="input input-bordered input-sm w-full bg-white text-[#1E1B4B]"
                                />
                            </div>
                        </div>
                    </div>
                )}

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
                            href="/users"
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
                            Unduh Berkas Sekarang
                        </SolidButton>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

