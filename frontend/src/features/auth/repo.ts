import { apiFetch, authHeaders } from "../../lib/api";
import type { Session, User } from "./types";

const SESSION_KEY = "sailconnect_session_v1";
const USER_KEY = "sailconnect_user_v1";

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

export async function login(email: string, password: string): Promise<User> {
    const user = await apiFetch<User>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    setStoredUser(user);
    setSession({ userId: user.id, createdAt: new Date().toISOString() });
    return user;
}

export async function register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
}): Promise<User> {
    const user = await apiFetch<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
    setStoredUser(user);
    setSession({ userId: user.id, createdAt: new Date().toISOString() });
    return user;
}

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

export function logout(): void {
    setSession(null);
    setStoredUser(null);
}
