const BASE = "/api";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const { headers: optHeaders, ...rest } = options ?? {};
    const res = await fetch(`${BASE}${path}`, {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            ...optHeaders,
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || res.statusText);
    }

    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
}

export function getStoredUserId(): string | null {
    try {
        const raw = localStorage.getItem("sailconnect_session_v1");
        if (!raw) return null;
        return JSON.parse(raw).userId ?? null;
    } catch {
        return null;
    }
}

/** Vrátí uložený JWT token z localStorage. */
export function getStoredToken(): string | null {
    try {
        const raw = localStorage.getItem("sailconnect_session_v1");
        if (!raw) return null;
        return JSON.parse(raw).token ?? null;
    } catch {
        return null;
    }
}

/**
 * Sestaví hlavičky pro autentizované požadavky.
 * Primárně posílá JWT Bearer token; X-User-Id jako fallback pro starší sessions.
 */
export function authHeaders(): Record<string, string> {
    const token = getStoredToken();
    if (token) return { "Authorization": `Bearer ${token}` };
    const id = getStoredUserId();
    return id ? { "X-User-Id": id } : {};
}
