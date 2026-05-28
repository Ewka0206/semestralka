import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header.tsx";
import { Footer } from "./Footer.tsx";
import { ScrollToTop } from "../components/ScrollToTop";

function getPageKey(pathname: string): string {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/trips/")) return "detail";
    if (pathname === "/login" || pathname === "/register") return "auth";
    if (pathname === "/dashboard") return "dashboard";
    if (pathname.startsWith("/offers/")) return "offer";
    if (pathname === "/me") return "profile";
    if (pathname.startsWith("/me/")) return "profile";
    if (pathname.startsWith("/bookings/")) return "booking";
    return "home";
}

export function MainLayout() {
    const { pathname } = useLocation();
    const pageKey = getPageKey(pathname);

    return (
        <div className="appShell">
            <Header />
            <ScrollToTop />
            <main className="main" data-page={pageKey}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
