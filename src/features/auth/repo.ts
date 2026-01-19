// TODO (později): AuthContext / useAuthProvider,
// aby Header reagoval reaktivně bez refresh a bez volání getCurrentUser() "natvrdo".


import { readJson, writeJson } from "../../lib/storage";
import type { Session, User } from "./types";

const USERS_KEY = "sailconnect_users_v1";
const SESSION_KEY = "sailconnect_session_v1";

export function getUsers(): User[] {
    return readJson<User[]>(USERS_KEY, []);
}

export function saveUsers(users: User[]): void {
    writeJson(USERS_KEY, users);
}

export function findUserByEmail(email: string): User | undefined {
    const users = getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function addUser(user: User): void {
    const users = getUsers();
    saveUsers([user, ...users]);
}

export function getSession(): Session | null {
    return readJson<Session | null>(SESSION_KEY, null);
}

export function setSession(session: Session | null): void {
    writeJson(SESSION_KEY, session);
}

export function getCurrentUser(): User | null {
    const session = getSession();
    if (!session) return null;
    const users = getUsers();
    return users.find((u) => u.id === session.userId) ?? null;
}

export function updateCurrentUser(patch: Partial<User>): User | null {
    const session = getSession();
    if (!session) return null;

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === session.userId);
    if (idx === -1) return null;

    const curr = users[idx];

    const next: User = {
        ...curr,
        ...patch,
        updatedAt: new Date().toISOString(),
    };

    const nextUsers = [...users];
    nextUsers[idx] = next;
    saveUsers(nextUsers);

    return next;
}

export function logout(): void {
    setSession(null);
}
