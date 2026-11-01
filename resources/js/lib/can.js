export function can(permissions, key) {
    return Array.isArray(permissions) && permissions.includes(key);
}
