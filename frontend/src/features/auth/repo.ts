import { apiFetch, authHeaders } from "../../lib/api";
import type { Session, User } from "./types";

const SESSION_KEY = "sailconnect_session_v1";
const USER_KEY    = "sailconnect_user_v1";

// ── Lokální úložiště ──────────────────────────────────────────────────────────

function setStoredUser(user: User | null): void {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_KEY);
    }
}

export function getSession(): Session | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setSession(session: Session | null): void {
    if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
    window.dispatchEvent(new Event("auth:changed"));
}

export function getCurrentUser(): User | null {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

// ── API volání ────────────────────────────────────────────────────────────────

/** LoginResponse odpověď ze serveru (nadmnožina User + JWT token). */
type LoginResponse = User & { token: string };

/**
 * Přihlásí uživatele – uloží JWT token a data uživatele do localStorage.
 * Token se následně posílá v hlavičce Authorization: Bearer.
 */
export async function login(email: string, password: string): Promise<User> {
    const res = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    const { token, ...user } = res;
    setStoredUser(user as User);
    setSession({ userId: user.id, token, createdAt: new Date().toISOString() });
    return user as User;
}

/**
 * Registruje nového uživatele – server rovnou vrátí token.
 */
export async function register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
}): Promise<User> {
    const res = await apiFetch<LoginResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
    const { token, ...user } = res;
    setStoredUser(user as User);
    setSession({ userId: user.id, token, createdAt: new Date().toISOString() });
    return user as User;
}

/** Aktualizuje profil přihlášeného uživatele. */
export async function updateCurrentUser(patch: Partial<User>): Promise<User | null> {
    const session = getSession();
    if (!session) return null;
    const user = await apiFetch<User>(`/users/${session.userId}`, {
        method: "PUT",
        body: JSON.stringify(patch),
        headers: authHeaders(),
    });
    setStoredUser(user);
    return user;
}

/** Odhlásí uživatele – vymaže session i uložená data. */
export function logout(): void {
    setSession(null);
    setStoredUser(null);
}
