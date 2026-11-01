import { useState } from 'react';
import SolidButton from '@/Components/ui/SolidButton';
import ExportFormatCardGrid from './ExportFormatCardGrid';
import ExportColumnSelector from './ExportColumnSelector';
import ExportFilterInputs from './ExportFilterInputs';

export default function ExportSection({
    availableRoles = [],
    actionOptions = [],
    stats = {},
    initialEntity = 'users',
    selectedIds = [],
}) {
    const [entity, setEntity] = useState(initialEntity); // 'users' | 'audit' | 'settings'
    const [selectedFormat, setSelectedFormat] = useState('csv');

    // Filter Pengguna & Audit
    const [userRole, setUserRole] = useState('');
    const [userStatus, setUserStatus] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [auditAction, setAuditAction] = useState('');
    const [auditSearch, setAuditSearch] = useState('');

    // Kolom Pengguna & Audit
    const userColumns = [
        { id: 'id', label: 'ID Pengguna' },
        { id: 'name', label: 'Nama Lengkap' },
        { id: 'email', label: 'Alamat Email' },
        { id: 'role', label: 'Peran Akun' },
        { id: 'status', label: 'Status Verifikasi' },
        { id: 'bio', label: 'Biodata' },
        { id: 'created_at', label: 'Tanggal Bergabung' },
    ];
    const [selectedUserCols, setSelectedUserCols] = useState(userColumns.map((c) => c.id));

    const auditColumns = [
        { id: 'id', label: 'ID Log' },
        { id: 'action', label: 'Tipe Aksi' },
        { id: 'description', label: 'Deskripsi Aktivitas' },
        { id: 'actor_name', label: 'Nama Aktor' },
        { id: 'actor_email', label: 'Email Aktor' },
        { id: 'ip_address', label: 'Alamat IP' },
        { id: 'user_agent', label: 'User Agent' },
        { id: 'created_at', label: 'Waktu Kejadian' },
    ];
    const [selectedAuditCols, setSelectedAuditCols] = useState(auditColumns.map((c) => c.id));

    const formats = [
        { id: 'csv', name: 'CSV Spreadsheet', ext: '.csv', badge: 'CSV', desc: 'Kompatibel dengan Microsoft Excel dan aplikasi perkantoran.' },
        { id: 'xlsx', name: 'Microsoft Excel', ext: '.xlsx', badge: 'XLSX', desc: 'Format OpenXML spreadsheet native untuk olah data kantor.' },
        { id: 'pdf', name: 'Dokumen PDF', ext: '.pdf', badge: 'PDF', desc: 'Laporan cetak formal dengan kop resmi BlockAuth.' },
        { id: 'docx', name: 'Microsoft Word', ext: '.docx', badge: 'DOCX', desc: 'Dokumen tabel laporan yang dapat disunting di Word.' },
        { id: 'json', name: 'Format Objek JSON', ext: '.json', badge: 'JSON', desc: 'Struktur data standar pertukaran REST API dan SIEM.' },
        { id: 'sql', name: 'Skrip SQL INSERT', ext: '.sql', badge: 'SQL', desc: 'Pernyataan INSERT INTO siap migrasi basis data.' },
        { id: 'md', name: 'Tabel Markdown', ext: '.md', badge: 'MD', desc: 'Format tabel teks untuk repositori Git, Notion, dan wiki.' },
        { id: 'html', name: 'Halaman Web HTML', ext: '.html', badge: 'HTML', desc: 'Tabel web standalone dengan palet tema solid BlockAuth.' },
        { id: 'txt', name: 'Teks Polos TSV', ext: '.txt', badge: 'TXT', desc: 'Format tab-separated untuk sistem legacy dan terminal.' },
    ];

    function toggleCol(cols, setCols, colId) {
        if (cols.includes(colId)) {
            if (cols.length > 1) setCols(cols.filter((c) => c !== colId));
        } else {
            setCols([...cols, colId]);
        }
    }

    function handleDownload() {
        if (entity === 'settings') {
            window.location.href = '/settings/backup?format=json';
            return;
        }

        const params = new URLSearchParams();
        params.set('format', selectedFormat);

        if (entity === 'users') {
            params.set('columns', selectedUserCols.join(','));
            if (selectedIds.length > 0) {
                params.set('ids', selectedIds.join(','));
            } else {
                if (userRole) params.set('role', userRole);
                if (userStatus) params.set('status', userStatus);
                if (userSearch) params.set('search', userSearch);
            }
            window.location.href = `/users/export/download?${params.toString()}`;
        } else if (entity === 'audit') {
            params.set('columns', selectedAuditCols.join(','));
            if (auditAction) params.set('action', auditAction);
            if (auditSearch) params.set('search', auditSearch);
            window.location.href = `/audit-logs/export/download?${params.toString()}`;
        }
    }

    return (
        <div className="space-y-6">
            {/* Pilihan Entitas Data yang Ingin Diekspor */}
            <div className="card-shell p-6">
                <h3 className="text-base font-bold text-[#1E1B4B]">Pilih Data yang Ingin Diekspor</h3>
                <p className="mt-1 text-xs text-slate-500">Tentukan modul data yang ingin Anda unduh dari sistem.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <button
                        type="button"
                        onClick={() => setEntity('users')}
                        className={`flex flex-col text-left rounded-xl border p-4 transition-all ${
                            entity === 'users'
                                ? 'border-[#6D28D9] bg-indigo-50/40 ring-1 ring-[#6D28D9]'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                    >
                        <span className="font-bold text-sm text-[#1E1B4B]">Data Pengguna</span>
                        <span className="mt-1 text-xs text-slate-500">Direktori akun, peran, dan status</span>
                        <span className="mt-3 inline-block rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-[#6D28D9] w-fit">
                            {stats.users_total || 0} Pengguna
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setEntity('audit')}
                        className={`flex flex-col text-left rounded-xl border p-4 transition-all ${
                            entity === 'audit'
                                ? 'border-[#6D28D9] bg-indigo-50/40 ring-1 ring-[#6D28D9]'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                    >
                        <span className="font-bold text-sm text-[#1E1B4B]">Log Audit Aktivitas</span>
                        <span className="mt-1 text-xs text-slate-500">Riwayat otentikasi & perubahan sistem</span>
                        <span className="mt-3 inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 w-fit">
                            {stats.audit_total || 0} Catatan Log
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setEntity('settings')}
                        className={`flex flex-col text-left rounded-xl border p-4 transition-all ${
                            entity === 'settings'
                                ? 'border-[#6D28D9] bg-indigo-50/40 ring-1 ring-[#6D28D9]'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                    >
                        <span className="font-bold text-sm text-[#1E1B4B]">Cadangan Pengaturan</span>
                        <span className="mt-1 text-xs text-slate-500">Snapshot konfigurasi sistem (JSON)</span>
                        <span className="mt-3 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 w-fit">
                            {stats.settings_total || 0} Kunci Konfigurasi
                        </span>
                    </button>
                </div>
            </div>

            {/* Jika Settings: Tampilan Sederhana Cadangan JSON */}
            {entity === 'settings' ? (
                <div className="card-shell p-6">
                    <h3 className="text-base font-bold text-[#1E1B4B]">Cadangan Konfigurasi Sistem (Backup JSON)</h3>
                    <p className="mt-1 text-sm text-[#334155]">
                        Mengunduh snapshot seluruh konfigurasi aplikasi, modul, dan standar keamanan ke dalam berkas JSON.
                    </p>
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>
                            <strong>Perlindungan Rahasia:</strong> Kata sandi SMTP dan Client Secret OAuth otomatis disensor menjadi <code>__REDACTED__</code> agar aman disimpan.
                        </span>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SolidButton type="button" variant="primary" size="sm" onClick={handleDownload}>
                            Unduh Berkas Cadangan JSON (.json)
                        </SolidButton>
                    </div>
                </div>
            ) : (
                <>
                    {/* Banner Jika Ada Selected IDs (Khusus Users) */}
                    {entity === 'users' && selectedIds.length > 0 && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-sm text-[#1E1B4B]">
                            <span className="font-bold">Mode Baris Terpilih:</span> Mengekspor{' '}
                            <span className="badge badge-sm border-0 bg-[#6D28D9] text-white font-bold mx-1">
                                {selectedIds.length} Pengguna
                            </span>{' '}
                            yang Anda centang sebelumnya dari tabel pengguna.
                        </div>
                    )}

                    {/* 1. Format Berkas Output */}
                    <ExportFormatCardGrid
                        formats={formats}
                        selectedFormat={selectedFormat}
                        onSelectFormat={setSelectedFormat}
                    />

                    {/* 2. Kolom Data yang Disertakan */}
                    <ExportColumnSelector
                        columns={entity === 'users' ? userColumns : auditColumns}
                        selectedColumns={entity === 'users' ? selectedUserCols : selectedAuditCols}
                        onToggleColumn={(colId) => {
                            if (entity === 'users') toggleCol(selectedUserCols, setSelectedUserCols, colId);
                            else toggleCol(selectedAuditCols, setSelectedAuditCols, colId);
                        }}
                        onSelectAll={() => {
                            if (entity === 'users') setSelectedUserCols(userColumns.map((c) => c.id));
                            else setSelectedAuditCols(auditColumns.map((c) => c.id));
                        }}
                    />

                    {/* 3. Saring Kriteria Data */}
                    {!(entity === 'users' && selectedIds.length > 0) && (
                        <ExportFilterInputs
                            entity={entity}
                            availableRoles={availableRoles}
                            actionOptions={actionOptions}
                            userRole={userRole}
                            setUserRole={setUserRole}
                            userStatus={userStatus}
                            setUserStatus={setUserStatus}
                            userSearch={userSearch}
                            setUserSearch={setUserSearch}
                            auditAction={auditAction}
                            setAuditAction={setAuditAction}
                            auditSearch={auditSearch}
                            setAuditSearch={setAuditSearch}
                        />
                    )}

                    {/* 4. Baris Tombol Unduh Ekspor */}
                    <div className="card-shell p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-[#1E1B4B]">
                                Format Terpilih: <span className="uppercase text-[#6D28D9]">{selectedFormat}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Berkas akan langsung diunduh ke komputer Anda.
                            </p>
                        </div>
                        <SolidButton type="button" variant="primary" size="sm" onClick={handleDownload}>
                            Unduh Berkas Sekarang
                        </SolidButton>
                    </div>
                </>
            )}
        </div>
    );
}
