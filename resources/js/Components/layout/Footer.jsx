export default function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-4">
                <p className="text-sm text-slate-500">
                    © {new Date().getFullYear()} BlockAuth. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
