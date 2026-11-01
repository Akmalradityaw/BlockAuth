import { useState, useEffect } from 'react';

export function useBulkSelection(filterDependency = null) {
    const [selectedIds, setSelectedIds] = useState([]);

    // Otomatis bersihkan seleksi ketika parameter pencarian / halaman berubah
    useEffect(() => {
        setSelectedIds([]);
    }, [JSON.stringify(filterDependency)]);

    function toggleSelect(id) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    }

    function toggleSelectAll(availableIds = []) {
        if (isAllSelected(availableIds)) {
            setSelectedIds([]);
        } else {
            setSelectedIds([...availableIds]);
        }
    }

    function isSelected(id) {
        return selectedIds.includes(id);
    }

    function isAllSelected(availableIds = []) {
        if (!availableIds || availableIds.length === 0) return false;
        return availableIds.every((id) => selectedIds.includes(id));
    }

    function clearSelection() {
        setSelectedIds([]);
    }

    return {
        selectedIds,
        setSelectedIds,
        toggleSelect,
        toggleSelectAll,
        isSelected,
        isAllSelected,
        clearSelection,
    };
}

