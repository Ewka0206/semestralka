import { useEffect, useState } from "react";
import type { User } from "./types";
import { getCurrentUser } from "./repo";

export function useAuth() {
    const [user, setUser] = useState<User | null>(() => getCurrentUser());

    useEffect(() => {
        // sync mezi taby (když user logoutne v jiné záložce)
        function onStorage() {
            setUser(getCurrentUser());
        }
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    return { user, refresh: () => setUser(getCurrentUser()) };
}