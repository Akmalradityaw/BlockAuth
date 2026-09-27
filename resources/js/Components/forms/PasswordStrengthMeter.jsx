import { usePage } from '@inertiajs/react';

export default function PasswordStrengthMeter({ password = '', customPolicy = null }) {
    const pagePolicy = usePage().props.password_policy;
    const policy = customPolicy || pagePolicy || {
        min_length: 8,
        require_uppercase: true,
        require_numeric: true,
        require_special_char: false,
    };

    if (!password) {
        return null;
    }

    const minLengthMet = password.length >= policy.min_length;
    const mixedCaseMet = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const numericMet = /[0-9]/.test(password);
    const specialMet = /[^A-Za-z0-9]/.test(password);

    // Hitung total kriteria aktif
    const criteria = [
        { label: `Minimal ${policy.min_length} karakter`, met: minLengthMet, required: true },
        { label: 'Huruf besar & kecil', met: mixedCaseMet, required: policy.require_uppercase },
        { label: 'Mengandung angka (0-9)', met: numericMet, required: policy.require_numeric },
        { label: 'Karakter khusus (!@#$%)', met: specialMet, required: policy.require_special_char },
    ];

    const activeCriteria = criteria.filter((c) => c.required);
    const passedCount = activeCriteria.filter((c) => c.met).length;
    const totalRequired = activeCriteria.length;
    const ratio = totalRequired > 0 ? passedCount / totalRequired : 0;

    let scoreLabel = 'Sangat Lemah';
    let scoreColor = 'bg-red-500';
    let textColor = 'text-red-600 dark:text-red-400';

    if (ratio === 1) {
        scoreLabel = 'Sangat Kuat';
        scoreColor = 'bg-emerald-500';
        textColor = 'text-emerald-700 dark:text-emerald-400';
    } else if (ratio >= 0.7) {
        scoreLabel = 'Kuat';
        scoreColor = 'bg-teal-500';
        textColor = 'text-teal-700 dark:text-teal-400';
    } else if (ratio >= 0.4) {
        scoreLabel = 'Cukup';
        scoreColor = 'bg-amber-500';
        textColor = 'text-amber-700 dark:text-amber-400';
    }

    return (
        <div className="mt-2 space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-3">
            <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Kekuatan Kata Sandi:</span>
                <span className={`font-bold ${textColor}`}>{scoreLabel}</span>
            </div>

            {/* Bar Indikator 4 Segmen */}
            <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((step) => {
                    const activeStep = ratio >= step / 4;
                    return (
                        <div
                            key={step}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                activeStep ? scoreColor : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                        />
                    );
                })}
            </div>

            {/* Checklist Persyaratan */}
            <div className="grid grid-cols-1 gap-1 pt-1 sm:grid-cols-2">
                {activeCriteria.map((item, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                            item.met ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                        }`}
                    >
                        <span
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] font-bold ${
                                item.met ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            {item.met ? '✓' : '•'}
                        </span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
