import { Link } from '@inertiajs/react';

export default function Pagination({ pagination, label = 'data' }) {
    if (!pagination || !pagination.links || pagination.links.length <= 1) {
        return null;
    }

    const { from, to, total, links } = pagination;

    return (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="type-caption text-[#334155]">
                {from && to
                    ? `Menampilkan ${from} sampai ${to} dari ${total} ${label}`
                    : `Total ${total} ${label}`}
            </p>
            <div className="join flex-wrap justify-center">
                {links.map((link, i) => {
                    const isActive = link.active;
                    const isDisabled = !link.url;

                    if (isDisabled) {
                        return (
                            <span
                                key={i}
                                className="join-item btn btn-sm border-slate-200 bg-slate-50 text-slate-400 pointer-events-none opacity-50"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={link.url}
                            preserveScroll
                            className={`join-item btn btn-sm ${
                                isActive
                                    ? 'border-0 bg-[#6D28D9] text-white'
                                    : 'border-slate-300 bg-white text-[#1E1B4B] hover:bg-slate-100'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

