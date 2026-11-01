import { useState } from 'react';

export function useClipboard(timeout = 2000) {
    const [copiedKey, setCopiedKey] = useState(null);

    async function copy(text, key = 'default') {
        if (!navigator?.clipboard) return false;

        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), timeout);
            return true;
        } catch {
            return false;
        }
    }

    return {
        copiedKey,
        isCopied: (key = 'default') => copiedKey === key,
        copy,
    };
}

export default useClipboard;

