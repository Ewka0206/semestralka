import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router.tsx";
import "./styles/global.css";
import { AuthProvider } from "./features/auth/AuthContext";

["sailconnect_trips_v1", "sailconnect_bookings_v1", "sailconnect_users_v1"].forEach((key) =>
    localStorage.removeItem(key)
);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>
);
