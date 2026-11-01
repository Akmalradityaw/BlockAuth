export default function StatCard({ label, value, note }) {
    return (
        <div className="card-shell p-4 sm:p-5">
            <p className="type-caption text-[#334155]">{label}</p>
            <p className="type-h1 text-[#1E1B4B]">{value}</p>
            {note && <p className="type-small mt-1 text-[#334155]">{note}</p>}
        </div>
    );
}

