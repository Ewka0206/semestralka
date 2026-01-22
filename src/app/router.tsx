import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "../layout/MainLayout";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";

const HomePage = lazy(() => import("../pages/HomePage").then((m) => ({ default: m.HomePage })));
const TripDetailPage = lazy(() => import("../pages/TripDetailPage").then((m) => ({ default: m.TripDetailPage })));
const LoginPage = lazy(() => import("../pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("../pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import("../pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const CreateOfferPage = lazy(() => import("../pages/CreateOfferPage").then((m) => ({ default: m.CreateOfferPage })));
const EditOfferPage = lazy(() => import("../pages/EditOfferPage").then((m) => ({ default: m.EditOfferPage })));
const BookingDetailPage = lazy(() => import("../pages/BookingDetailPage").then((m) => ({ default: m.BookingDetailPage })));
const EditBookingPage = lazy(() => import("../pages/EditBookingPage").then((m) => ({ default: m.EditBookingPage })));
const UserDetailPage = lazy(() => import("../pages/UserDetailPage").then((m) => ({ default: m.UserDetailPage })));
const EditUserPage = lazy(() => import("../pages/EditUserPage").then((m) => ({ default: m.EditUserPage })));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

function withSuspense(node: React.ReactNode) {
    return <Suspense fallback={<div className="container">Načítám…</div>}>{node}</Suspense>;
}

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: withSuspense(<HomePage />) },
            { path: "trips/:tripId", element: withSuspense(<TripDetailPage />) },
            { path: "login", element: withSuspense(<LoginPage />) },
            { path: "register", element: withSuspense(<RegisterPage />) },

            {
                element: <ProtectedRoute />,
                children: [
                    { path: "dashboard", element: withSuspense(<DashboardPage />) },

                    { path: "offers/new", element: withSuspense(<CreateOfferPage />) },
                    { path: "offers/:tripId/edit", element: withSuspense(<EditOfferPage />) },

                    { path: "bookings/:bookingId", element: withSuspense(<BookingDetailPage />) },
                    { path: "bookings/:bookingId/edit", element: withSuspense(<EditBookingPage />) },

                    { path: "me", element: withSuspense(<UserDetailPage />) },
                    { path: "me/edit", element: withSuspense(<EditUserPage />) },
                ],
            },

            { path: "*", element: withSuspense(<NotFoundPage />) },
        ],
    },
]);