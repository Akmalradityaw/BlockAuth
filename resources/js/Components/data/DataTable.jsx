import { useState } from 'react';
import Pagination from './Pagination';

function SortIcon({ active, direction }) {
    if (!active) {
        return (
            <span className="text-slate-300 group-hover:text-slate-500 transition-colors">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5-5 5 5M7 14l5 5 5-5" />
                </svg>
            </span>
        );
    }

    if (direction === 'asc') {
        return (
            <span className="text-[#6D28D9]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
            </span>
        );
    }

    return (
        <span className="text-[#6D28D9]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </span>
    );
}

export default function DataTable({
    columns = [],
    data = [],
    keyField = 'id',
    sort = null,
    direction = 'desc',
    onSort = null,
    search = '',
    onSearch = null,
    searchPlaceholder = 'Cari data...',
    filterSlot = null,
    actionsSlot = null,
    selectable = false,
    selectedIds = [],
    onSelectionChange = null,
    bulkActionsSlot = null,
    renderRow = null,
    renderMobileCard = null,
    pagination = null,
    onPerPageChange = null,
    emptyTitle = 'Tidak ada data',
    emptyMessage = 'Belum ada data yang sesuai dengan pencarian atau filter yang dipilih.',
    className = '',
}) {
    const [localSearch, setLocalSearch] = useState(search || '');

    function handleSearchSubmit(e) {
        e?.preventDefault();
        onSearch?.(localSearch);
    }

    function handleClearSearch() {
        setLocalSearch('');
        onSearch?.('');
    }

    function handleSort(key, isSortable) {
        if (!isSortable || !onSort) return;
        if (sort === key) {
            onSort(key, direction === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(key, 'asc');
        }
    }

    const allIds = data.map((item) => item[keyField]);
    const isAllSelected = selectable && allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
    const isSomeSelected = selectable && allIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

    function toggleSelectAll() {
        if (!onSelectionChange) return;
        if (isAllSelected) {
            onSelectionChange(selectedIds.filter((id) => !allIds.includes(id)));
        } else {
            const combined = Array.from(new Set([...selectedIds, ...allIds]));
            onSelectionChange(combined);
        }
    }

    function toggleSelectRow(id) {
        if (!onSelectionChange) return;
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((item) => item !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    }

    const sortableColumns = columns.filter((col) => col.sortable);

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Toolbar: Search, Filters, & Action Buttons */}
            {(onSearch || filterSlot || actionsSlot) && (
                <div className="card-shell p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search & Custom Filter Inputs */}
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            {onSearch && (
                                <form onSubmit={handleSearchSubmit} className="relative flex-1">
                                    <input
                                        type="text"
                                        value={localSearch}
                                        onChange={(e) => setLocalSearch(e.target.value)}
                                        placeholder={searchPlaceholder}
                                        className="input input-sm w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pr-8 text-sm text-[#1E1B4B] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#6D28D9] focus:outline-none transition-colors"
                                    />
                                    {localSearch && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </form>
                            )}

                            {filterSlot && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {filterSlot}
                                </div>
                            )}

                            {onSearch && (
                                <button
                                    type="button"
                                    onClick={handleSearchSubmit}
                                    className="btn btn-sm border-0 bg-[#6D28D9] text-white hover:bg-[#5b21b6]"
                                >
                                    Cari
                                </button>
                            )}
                        </div>

                        {/* Right Actions Slot */}
                        {actionsSlot && (
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                {actionsSlot}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bulk Selection Notification Bar */}
            {selectable && selectedIds.length > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-4 py-2.5 text-xs font-semibold text-[#6D28D9] dark:text-purple-300">
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6D28D9] text-[10px] font-bold text-white">
                            {selectedIds.length}
                        </span>
                        <span>Item dipilih pada tabel</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {bulkActionsSlot}
                        <button
                            type="button"
                            onClick={() => onSelectionChange?.([])}
                            className="btn btn-xs border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 text-[#6D28D9] dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-slate-700"
                        >
                            Batal Pilihan
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile View: Sort Selector & Cards */}
            <div className="space-y-3 lg:hidden">
                {sortableColumns.length > 0 && onSort && (
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3 text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Urutkan:</span>
                        <div className="flex items-center gap-2">
                            <select
                                value={sort || ''}
                                onChange={(e) => onSort(e.target.value, direction)}
                                className="select select-xs border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            >
                                {sortableColumns.map((col) => (
                                    <option key={col.key} value={col.key}>
                                        {col.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => onSort(sort || sortableColumns[0]?.key, direction === 'asc' ? 'desc' : 'asc')}
                                className="btn btn-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono"
                            >
                                {direction === 'asc' ? '↑ Naik' : '↓ Turun'}
                            </button>
                        </div>
                    </div>
                )}

                {data.length === 0 ? (
                    <div className="card-shell p-8 text-center text-slate-500 dark:text-slate-400">
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">{emptyTitle}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{emptyMessage}</p>
                    </div>
                ) : renderMobileCard ? (
                    data.map((item, index) => renderMobileCard(item, index, selectedIds.includes(item[keyField])))
                ) : (
                    // Default Fallback Mobile Card jika custom renderMobileCard tidak disediakan
                    data.map((item, index) => (
                        <div key={item[keyField] || index} className="card-shell space-y-2 p-4">
                            {selectable && (
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item[keyField])}
                                        onChange={() => toggleSelectRow(item[keyField])}
                                        className="checkbox checkbox-sm checkbox-primary"
                                    />
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pilih baris ini</span>
                                </div>
                            )}
                            {columns.map((col) => (
                                <div key={col.key} className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-slate-500 dark:text-slate-400">{col.label}:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {col.render ? col.render(item[col.key], item, index) : item[col.key] ?? '-'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* Desktop View: Interactive Table */}
            <div className="card-shell hidden overflow-hidden lg:block">
                <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[#1E1B4B] dark:text-slate-100">
                                {selectable && (
                                    <th className="w-10 py-3 pl-4">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = isSomeSelected;
                                            }}
                                            onChange={toggleSelectAll}
                                            className="checkbox checkbox-sm checkbox-primary"
                                            aria-label="Pilih semua baris"
                                        />
                                    </th>
                                )}

                                {columns.map((col) => {
                                    const isActiveSort = sort === col.key;
                                    return (
                                        <th
                                            key={col.key}
                                            onClick={() => handleSort(col.key, col.sortable)}
                                            className={`py-3 text-xs font-bold uppercase tracking-wider ${
                                                col.headerClassName || ''
                                            } ${
                                                col.sortable
                                                    ? 'group cursor-pointer select-none hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-colors'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>{col.label}</span>
                                                {col.sortable && (
                                                    <SortIcon active={isActiveSort} direction={direction} />
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + (selectable ? 1 : 0)}
                                        className="py-12 text-center text-slate-500 dark:text-slate-400"
                                    >
                                        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">{emptyTitle}</p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{emptyMessage}</p>
                                    </td>
                                </tr>
                            ) : renderRow ? (
                                data.map((item, index) => renderRow(item, index, selectedIds.includes(item[keyField])))
                            ) : (
                                // Default Row Renderer
                                data.map((item, index) => {
                                    const isSelected = selectedIds.includes(item[keyField]);
                                    return (
                                        <tr
                                            key={item[keyField] || index}
                                            className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50 ${
                                                isSelected ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''
                                            }`}
                                        >
                                            {selectable && (
                                                <td className="py-3 pl-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectRow(item[keyField])}
                                                        className="checkbox checkbox-sm checkbox-primary"
                                                    />
                                                </td>
                                            )}

                                            {columns.map((col) => (
                                                <td key={col.key} className={`py-3 text-xs ${col.className || ''}`}>
                                                    {col.render ? col.render(item[col.key], item, index) : item[col.key] ?? '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Component Integration */}
            {pagination && (
                <Pagination
                    links={pagination.links || []}
                    from={pagination.from}
                    to={pagination.to}
                    total={pagination.total}
                    perPage={pagination.per_page}
                    onPerPageChange={onPerPageChange}
                />
            )}
        </div>
    );
}
