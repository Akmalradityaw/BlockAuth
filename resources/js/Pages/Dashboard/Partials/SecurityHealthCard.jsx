import { Link } from '@inertiajs/react';

export default function SecurityHealthCard({ health }) {
    if (!health) return null;

    const { score, grade, status, items = [] } = health;

    const barColor =
        score >= 90
            ? 'bg-emerald-500'
            : score >= 75
            ? 'bg-indigo-600'
            : score >= 60
            ? 'bg-[#F59E0B]'
            : 'bg-red-500';

    return (
        <section className="card-shell mt-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="type-h2 text-[#1E1B4B]">Postur Keamanan Sistem</h2>
                        <span className="badge border-0 bg-purple-100 text-xs font-bold text-[#6D28D9]">
                            Grade {grade} ({score}/100)
                        </span>
                    </div>
                    <p className="type-small mt-0.5 text-[#334155]">
                        Status: <strong className="text-[#1E1B4B]">{status}</strong>. Ringkasan kesiapan keamanan autentikasi & kepatuhan data.
                    </p>
                </div>
                <Link
                    href="/settings"
                    className="type-small shrink-0 font-semibold text-[#6D28D9] hover:underline"
                >
                    Konfigurasi Kebijakan ›
                </Link>
            </div>

            <div className="mt-4">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className={`h-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-2.5 rounded-xl border p-3 ${
                            item.passed
                                ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                                : 'border-amber-200 bg-amber-50/40 text-amber-900'
                        }`}
                    >
                        <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                                item.passed ? 'bg-emerald-600' : 'bg-amber-600'
                            }`}
                        >
                            {item.passed ? '✓' : '!'}
                        </span>
                        <div className="min-w-0 flex-1 leading-tight">
                            <p className="text-xs font-bold text-[#1E1B4B]">{item.name}</p>
                            <p className="type-caption mt-0.5 truncate text-[#334155]">{item.detail}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

