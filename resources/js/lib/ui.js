export function initials(name) {
    return (name || '?').charAt(0).toUpperCase();
}

export function isActive(url, href, exact = false) {
    if (!url || !href) return false;

    // Bersihkan query string (?...) dan hash (#...) agar tetap aktif saat pagination/filter/sort
    const currentPath = (url.split('?')[0].split('#')[0] || '/').replace(/\/+$/, '') || '/';
    const targetPath = (href.split('?')[0].split('#')[0] || '/').replace(/\/+$/, '') || '/';

    if (targetPath === '/' || exact) {
        return currentPath === targetPath;
    }

    return currentPath === targetPath || currentPath.startsWith(targetPath + '/');
}
