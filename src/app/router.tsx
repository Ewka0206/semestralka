import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";
import { HomePage } from "../pages/HomePage";
import { TripDetailPage } from "../pages/TripDetailPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { CreateOfferPage } from "../pages/CreateOfferPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "trips/:tripId", element: <TripDetailPage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },

            // ✅ chráněné
            {
                element: <ProtectedRoute />,
                children: [{ path: "dashboard", element: <DashboardPage /> }],
            },

            // ✅ chráněné (stačí přihlášení)
            {
                element: <ProtectedRoute />,
                children: [{ path: "offers/new", element: <CreateOfferPage /> }],
            },

            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);