export default function Footer() {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} BlockAuth. All rights reserved.
                </p>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    v2.1.3
                </p>
            </div>
        </footer>
    );
}
