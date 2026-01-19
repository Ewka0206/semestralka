export type UserRole = "crew" | "captain";

export type User = {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    createdAt: string; // ISO
    updatedAt: string;
};

export type Session = {
    userId: string;
    createdAt: string; // ISO
};