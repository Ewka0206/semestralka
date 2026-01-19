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
import { EditOfferPage } from "../pages/EditOfferPage";
import { EditBookingPage } from "../pages/EditBookingPage";
import { BookingDetailPage } from "../pages/BookingDetailPage";
import { UserDetailPage } from "../pages/UserDetailPage";
import { EditUserPage } from "../pages/EditUserPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "trips/:tripId", element: <TripDetailPage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },

            {
                element: <ProtectedRoute />,
                children: [{ path: "dashboard", element: <DashboardPage /> }],
            },

            {
                element: <ProtectedRoute />,
                children: [
                    { path: "offers/new", element: <CreateOfferPage /> },
                    { path: "offers/:tripId/edit", element: <EditOfferPage /> },
                    { path: "bookings/:bookingId", element: <BookingDetailPage /> },
                    { path: "bookings/:bookingId/edit", element: <EditBookingPage /> },
                    { path: "dashboard", element: <DashboardPage /> },
                    { path: "me", element: <UserDetailPage /> },
                    { path: "me/edit", element: <EditUserPage /> },
                ],
            },

            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);