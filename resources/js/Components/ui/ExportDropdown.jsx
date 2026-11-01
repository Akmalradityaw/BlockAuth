import { useState, useRef, useEffect } from 'react';

export default function ExportDropdown({
    baseUrl = '/users/export',
    queryParams = {},
    selectedIds = [],
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const formats = [
        { id: 'csv', label: 'CSV Spreadsheet (.csv)', badge: 'CSV' },
        { id: 'xlsx', label: 'Microsoft Excel (.xlsx)', badge: 'XLS' },
        { id: 'pdf', label: 'Dokumen PDF (.pdf)', badge: 'PDF' },
        { id: 'docx', label: 'Microsoft Word (.docx)', badge: 'DOC' },
        { id: 'json', label: 'Format JSON (.json)', badge: 'JSON' },
        { id: 'sql', label: 'Skrip SQL INSERT (.sql)', badge: 'SQL' },
        { id: 'md', label: 'Tabel Markdown (.md)', badge: 'MD' },
        { id: 'html', label: 'Halaman Web HTML (.html)', badge: 'HTML' },
        { id: 'txt', label: 'Teks Polos TSV (.txt)', badge: 'TXT' },
    ];

    // Tutup dropdown jika klik di luar
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleExport(formatId) {
        setIsOpen(false);
        const params = new URLSearchParams();

        // Masukkan filter yang aktif
        Object.entries(queryParams).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                params.set(k, v);
            }
        });

        // Masukkan format
        params.set('format', formatId);

        // Masukkan selectedIds jika ada
        if (selectedIds && selectedIds.length > 0) {
            params.set('ids', selectedIds.join(','));
        }

        const url = `${baseUrl}?${params.toString()}`;
        // Gunakan navigasi native agar berkas biner diunduh langsung tanpa dicegat XHR Inertia
        window.location.href = url;
    }

    return (
        <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-50 flex items-center gap-1.5 font-medium"
                title="Ekspor data dalam 9 pilihan format"
            >
                <svg className="h-4 w-4 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Ekspor Data</span>
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-1.5 w-56 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                    <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Pilih Format Ekspor
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {formats.map((fmt) => (
                            <button
                                key={fmt.id}
                                type="button"
                                onClick={() => handleExport(fmt.id)}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-[#1E1B4B] transition-colors"
                            >
                                <span className="rounded px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                                    {fmt.badge}
                                </span>
                                <span>{fmt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

