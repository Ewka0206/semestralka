import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "./types";
import { getCurrentUser, logout as repoLogout, updateCurrentUser as repoUpdateCurrentUser } from "./repo";

type AuthContextValue = {
    user: User | null;
    isLoggedIn: boolean;
    refresh: () => void;
    logout: () => void;
    updateUser: (patch: Partial<User>) => User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => getCurrentUser());

    function refresh() {
        setUser(getCurrentUser());
    }

    function logout() {
        repoLogout();
        setUser(null);
    }

    function updateUser(patch: Partial<User>) {
        const next = repoUpdateCurrentUser(patch);
        setUser(next ?? getCurrentUser());
        return next;
    }

    useEffect(() => {
        function onAuthChanged() {
            refresh();
        }

        function onStorage() {
            refresh();
        }

        window.addEventListener("auth:changed", onAuthChanged);
        window.addEventListener("storage", onStorage);

        // initial sync
        refresh();

        return () => {
            window.removeEventListener("auth:changed", onAuthChanged);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    const value = useMemo<AuthContextValue>(() => {
        return {
            user,
            isLoggedIn: Boolean(user),
            refresh,
            logout,
            updateUser,
        };
    }, [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within <AuthProvider>.");
    }
    return ctx;
}
