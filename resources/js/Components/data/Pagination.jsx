import { Link } from '@inertiajs/react';

export default function Pagination({
    links = [],
    from = 0,
    to = 0,
    total = 0,
    perPage = 10,
    onPerPageChange = null,
    perPageOptions = [10, 25, 50, 100],
    className = '',
}) {
    if (!total || total === 0) {
        return null;
    }

    // Ekstrak current page dan last page dari links jika memungkinkan
    const numericLinks = links.filter((l) => !isNaN(parseInt(l.label)));
    const activeLink = numericLinks.find((l) => l.active);
    const currentPage = activeLink ? parseInt(activeLink.label) : 1;
    const lastPage = numericLinks.length > 0 ? parseInt(numericLinks[numericLinks.length - 1].label) : 1;

    const prevLink = links[0];
    const nextLink = links[links.length - 1];

    return (
        <div className={`flex flex-col gap-4 border-t border-slate-200/80 dark:border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
            {/* Info Range & Per Page Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-start">
                <p className="text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                    {from && to ? (
                        <>
                            Menampilkan <span className="font-semibold text-slate-900 dark:text-slate-100">{from}</span>–
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{to}</span> dari{' '}
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{total}</span> data
                        </>
                    ) : (
                        <>
                            Total <span className="font-semibold text-slate-900 dark:text-slate-100">{total}</span> data
                        </>
                    )}
                </p>

                {onPerPageChange && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>Tampilkan:</span>
                        <select
                            value={perPage}
                            onChange={(e) => onPerPageChange(parseInt(e.target.value))}
                            className="select select-bordered select-xs h-7 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 focus:border-[#6D28D9] focus:outline-none"
                        >
                            {perPageOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt} / hal
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Mobile Pagination (Ringkas & Ramah Sentuhan) */}
            <div className="flex items-center justify-between gap-2 sm:hidden">
                {prevLink?.url ? (
                    <Link
                        href={prevLink.url}
                        preserveScroll
                        className="btn btn-sm flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        Sebelumnya
                    </Link>
                ) : (
                    <button
                        type="button"
                        disabled
                        className="btn btn-sm flex-1 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-xs font-semibold text-slate-400 dark:text-slate-600"
                    >
                        Sebelumnya
                    </button>
                )}

                <span className="px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {currentPage} / {lastPage}
                </span>

                {nextLink?.url ? (
                    <Link
                        href={nextLink.url}
                        preserveScroll
                        className="btn btn-sm flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        Berikutnya
                    </Link>
                ) : (
                    <button
                        type="button"
                        disabled
                        className="btn btn-sm flex-1 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-xs font-semibold text-slate-400 dark:text-slate-600"
                    >
                        Berikutnya
                    </button>
                )}
            </div>

            {/* Desktop Pagination (Full Interactive Buttons) */}
            <div className="hidden sm:flex sm:items-center sm:gap-1">
                {links.map((link, index) => {
                    const isPrev = index === 0;
                    const isNext = index === links.length - 1;
                    const isDots = link.label === '...';

                    if (isDots) {
                        return (
                            <span
                                key={index}
                                className="flex h-8 min-w-[2rem] items-center justify-center text-xs text-slate-400 dark:text-slate-600"
                            >
                                …
                            </span>
                        );
                    }

                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className="flex h-8 min-w-[2rem] cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-2.5 text-xs font-medium text-slate-400 dark:text-slate-600"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition-all ${
                                link.active
                                    ? 'bg-[#6D28D9] text-white shadow-sm'
                                    : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
