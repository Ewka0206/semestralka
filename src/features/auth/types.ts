export type UserRole = "crew" | "captain";

export type User = {
    id: string;
    email: string;
    password: string; // pro semestrálku OK (v reálu ne)
    name: string;
    role: UserRole;
    createdAt: string; // ISO
};

export type Session = {
    userId: string;
    createdAt: string; // ISO
};