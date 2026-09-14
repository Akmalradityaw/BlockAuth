export default function FormInput({ label, error, hint, ...props }) {
    return (
        <div className="form-control w-full">
            {label && (
                <label className="label pb-1">
                    <span className="type-small font-semibold text-[#1E1B4B]">{label}</span>
                </label>
            )}
            <input
                {...props}
                className="input input-bordered input-brand w-full bg-white text-base text-[#1E1B4B]"
            />
            {hint && !error && <span className="type-small mt-1 text-[#334155]">{hint}</span>}
            {error && <span className="type-small mt-1 text-[#B91C1C]">{error}</span>}
        </div>
    );
}
