import { Navigate, Outlet } from "react-router-dom";
import type { UserRole } from "./types";
import { getCurrentUser } from "./repo";

type Props = {
    requiredRole?: UserRole;
};

export function ProtectedRoute({ requiredRole }: Props) {
    const user = getCurrentUser();

    if (!user) return <Navigate to="/login" replace />;

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}