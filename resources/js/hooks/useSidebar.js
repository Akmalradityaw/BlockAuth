import { useEffect, useState } from 'react';

export function useSidebar() {
    const [mode, setMode] = useState(() => {
        try {
            return localStorage.getItem('sidebar-mode') || 'expanded';
        } catch {
            return 'expanded';
        }
    });

    const [lastVisibleMode, setLastVisibleMode] = useState(() => {
        try {
            const saved = localStorage.getItem('sidebar-last-visible');
            return saved === 'rail' ? 'rail' : 'expanded';
        } catch {
            return 'expanded';
        }
    });

    const [mobileOpen, setMobileOpen] = useState(false);

    // Toggle minimize antara expanded (w-72) dan rail (w-20)
    function toggleMinimize() {
        setMode((current) => {
            const next = current === 'rail' ? 'expanded' : 'rail';
            setLastVisibleMode(next);
            try {
                localStorage.setItem('sidebar-mode', next);
                localStorage.setItem('sidebar-last-visible', next);
            } catch {
                // abaikan error storage
            }
            return next;
        });
    }

    // Toggle full hide (mode fokus: sembunyikan sidebar ke luar layar)
    function toggleFullHide() {
        setMode((current) => {
            let next;
            if (current === 'hidden') {
                next = lastVisibleMode;
            } else {
                next = 'hidden';
            }
            try {
                localStorage.setItem('sidebar-mode', next);
            } catch {
                // abaikan error storage
            }
            return next;
        });
    }

    // Shortcut keyboard Ctrl+B / Cmd+B untuk toggle mode fokus
    useEffect(() => {
        function handleKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                const target = e.target;
                const isInput =
                    target instanceof HTMLInputElement ||
                    target instanceof HTMLTextAreaElement ||
                    target?.isContentEditable;

                if (!isInput) {
                    e.preventDefault();
                    toggleFullHide();
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lastVisibleMode]);

    return {
        mode,
        isRail: mode === 'rail',
        isHidden: mode === 'hidden',
        mobileOpen,
        setMobileOpen,
        toggleMinimize,
        toggleFullHide,
    };
}

export default useSidebar;

