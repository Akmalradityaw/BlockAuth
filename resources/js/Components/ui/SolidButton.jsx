export default function SolidButton({
    children,
    processing = false,
    variant = 'primary',
    fullWidth = true,
    className = '',
    ...props
}) {
    const styles =
        variant === 'amber'
            ? 'bg-[#F59E0B] text-[#1E1B4B] hover:bg-[#B45309] hover:text-white'
            : variant === 'danger' || variant === 'critical'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'btn-brand text-white';

    const hasExplicitWidth = className.includes('w-') || className.includes('shrink');
    const widthClass = !fullWidth || hasExplicitWidth ? '' : 'w-full';

    return (
        <button
            {...props}
            disabled={processing}
            className={`btn border-0 ${widthClass} ${styles} ${className} disabled:opacity-60`}
        >
            {processing ? 'Memproses...' : children}
        </button>
    );
}

