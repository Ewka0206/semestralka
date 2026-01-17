import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout.tsx";
import { HomePage } from "../pages/HomePage.tsx";
import { TripDetailPage } from "../pages/TripDetailPage.tsx";
import { LoginPage } from "../pages/LoginPage.tsx";
import { RegisterPage } from "../pages/RegisterPage.tsx";
import { DashboardPage } from "../pages/DashboardPage.tsx";
import { CreateOfferPage } from "../pages/CreateOfferPage.tsx";
import { NotFoundPage } from "../pages/NotFoundPage.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "trips/:tripId", element: <TripDetailPage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },

            // zatím bez ochrany (ProtectedRoute přidáme v dalším kroku)
            { path: "dashboard", element: <DashboardPage /> },
            { path: "offers/new", element: <CreateOfferPage /> },

            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);
