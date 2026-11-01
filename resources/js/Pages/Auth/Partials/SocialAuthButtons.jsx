import { DriverIcon, getDriverStyle } from '@/lib/oauthProviders';

export default function SocialAuthButtons({ providers, mode = 'login' }) {
    let list = [];

    if (Array.isArray(providers)) {
        list = providers;
    } else if (providers?.list && Array.isArray(providers.list)) {
        list = providers.list;
    } else if (providers) {
        if (providers.google) list.push({ id: 'google', name: 'Google', driver: 'google' });
        if (providers.github) list.push({ id: 'github', name: 'GitHub', driver: 'github' });
    }

    if (!list || list.length === 0) {
        return null;
    }

    const dividerText = mode === 'register' ? 'atau daftar dengan' : 'atau lanjut dengan';
    const gridCols = list.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';

    return (
        <div className="w-full">
            <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="type-caption text-[#334155]">{dividerText}</span>
                <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className={`grid gap-2.5 ${gridCols}`}>
                {list.map((p) => (
                    <a
                        key={p.id}
                        href={`/oauth/${p.id}/redirect`}
                        className={`btn flex items-center justify-center gap-2 font-semibold shadow-sm transition-colors ${getDriverStyle(
                            p.driver
                        )}`}
                    >
                        <DriverIcon driver={p.driver} />
                        <span className="truncate">{p.name || p.driver}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}

