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

export function authHeaders(): Record<string, string> {
    const id = getStoredUserId();
    return id ? { "X-User-Id": id } : {};
}
