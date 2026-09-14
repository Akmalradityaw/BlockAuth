export function initials(name) {
    return (name || '?').charAt(0).toUpperCase();
}

export function isActive(url, href) {
    if (href === '/') return url === '/';
    return url === href || url.startsWith(href + '/');
}
