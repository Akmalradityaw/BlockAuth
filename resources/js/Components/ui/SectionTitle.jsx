export default function SectionTitle({ eyebrow, title, desc }) {
    return (
        <div className="mb-4">
            {eyebrow && <p className="type-caption text-[#6D28D9]">{eyebrow}</p>}
            <h2 className="type-h2 text-[#1E1B4B]">{title}</h2>
            {desc && <p className="type-small mt-1 text-[#334155]">{desc}</p>}
        </div>
    );
}

