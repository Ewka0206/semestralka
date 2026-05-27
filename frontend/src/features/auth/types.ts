export type UserRole = "crew" | "captain";

export type User = {
    id: string;
    email: string;
    password?: string; // není vraceno z API
    name: string;
    role: UserRole;
    createdAt: string; // ISO
    updatedAt: string;
};

export type Session = {
    userId: string;
    token: string;      // JWT Bearer token
    createdAt: string;  // ISO
};