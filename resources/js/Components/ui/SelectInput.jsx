export default function SelectInput({
    label,
    error,
    hint,
    options = [],
    className = '',
    children,
    ...props
}) {
    return (
        <div className="form-control w-full">
            {label && (
                <label className="label pb-1">
                    <span className="type-small font-semibold text-[#1E1B4B]">{label}</span>
                </label>
            )}
            <select
                {...props}
                className={`select select-bordered h-11 min-h-[2.75rem] w-full rounded-xl bg-white text-base text-[#1E1B4B] focus:border-[#6D28D9] focus:outline-none ${
                    error ? 'border-red-500' : 'border-slate-300'
                } ${className}`}
            >
                {options.length > 0
                    ? options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                              {opt.label}
                          </option>
                      ))
                    : children}
            </select>
            {hint && !error && <span className="type-small mt-1 text-[#334155]">{hint}</span>}
            {error && <span className="type-small mt-1 text-[#B91C1C]">{error}</span>}
        </div>
    );
}

