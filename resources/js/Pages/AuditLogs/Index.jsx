import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/ui/Pagination';
import AuditStats from './Partials/AuditStats';
import AuditFilterBar from './Partials/AuditFilterBar';
import AuditTable from './Partials/AuditTable';
import AuditPayloadModal from './Partials/AuditPayloadModal';

export default function AuditLogIndex({ logs, filters = {}, stats, actionOptions = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || '');
    const [activeMetadata, setActiveMetadata] = useState(null);

    function applyFilter(params = {}) {
        router.get(
            '/audit-logs',
            {
                search: params.search ?? search,
                action: params.action ?? action,
            },
            { preserveState: true, replace: true }
        );
    }

    function handleResetFilters() {
        setSearch('');
        setAction('');
        router.get('/audit-logs', {}, { preserveState: true, replace: true });
    }

    const hasActiveFilters = Boolean(filters.search || filters.action);

    return (
        <AppLayout
            eyebrow="Audit & Kepatuhan"
            title="Log Aktivitas Sistem"
            desc="Rekam jejak seluruh aktivitas autentikasi, manajemen data, dan perubahan konfigurasi sistem."
            actions={
                <Link
                    href="/dashboard"
                    className="btn btn-sm border border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-100"
                >
                    Kembali ke Dashboard
                </Link>
            }
        >
            <Head title="Log Aktivitas Sistem" />

            <AuditStats stats={stats} />

            <AuditFilterBar
                search={search}
                setSearch={setSearch}
                action={action}
                setAction={setAction}
                actionOptions={actionOptions}
                onApply={applyFilter}
                onReset={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
            />

            <AuditTable logs={logs.data} onInspect={setActiveMetadata} />

            <div className="mt-4">
                <Pagination pagination={logs} label="log aktivitas" />
            </div>

            <AuditPayloadModal
                log={activeMetadata}
                onClose={() => setActiveMetadata(null)}
            />
        </AppLayout>
    );
}
