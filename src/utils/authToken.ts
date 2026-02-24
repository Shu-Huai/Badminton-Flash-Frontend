const TOKEN_KEY = 'bf_token';

export function getToken(): string {
    return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setToken(token: string): void {
    if (!token) {
        localStorage.removeItem(TOKEN_KEY);
        return;
    }
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

function decodePayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length < 2) {
        return null;
    }
    const payloadPart = parts[1];
    if (!payloadPart) {
        return null;
    }
    try {
        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
                .join(''),
        );
        return JSON.parse(json) as Record<string, unknown>;
    } catch {
        return null;
    }
}

export function getRoleFromToken(token: string): 'USER' | 'ADMIN' | '' {
    const payload = decodePayload(token);
    const role = payload?.role;
    if (role === 'USER' || role === 'ADMIN') {
        return role;
    }
    return '';
}
