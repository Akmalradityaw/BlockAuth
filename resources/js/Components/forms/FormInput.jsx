export default function FormInput({ label, error, hint, ...props }) {
    return (
        <div className="form-control w-full">
            {label && (
                <label className="label pb-1">
                    <span className="type-small font-semibold text-[#1E1B4B] dark:text-slate-200">{label}</span>
                </label>
            )}
            <input
                {...props}
                className="input input-bordered input-brand w-full bg-white dark:bg-slate-800 dark:border-slate-700 text-base text-[#1E1B4B] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
            />
            {hint && !error && <span className="type-small mt-1 text-[#334155] dark:text-slate-400">{hint}</span>}
            {error && <span className="type-small mt-1 text-[#B91C1C] dark:text-rose-400">{error}</span>}
        </div>
    );
}
