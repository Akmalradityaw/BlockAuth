export default function SolidButton({ children, processing = false, variant = 'primary', ...props }) {
    const styles =
        variant === 'amber'
            ? 'bg-[#F59E0B] text-[#1E1B4B] hover:bg-[#B45309] hover:text-white'
            : 'btn-brand text-white';
    return (
        <button {...props} disabled={processing} className={`btn w-full border-0 text-base ${styles} disabled:opacity-60`}>
            {processing ? 'Memproses...' : children}
        </button>
    );
}
