import { Outlet } from "react-router-dom";
import { Header } from "./Header.tsx";
import { Footer } from "./Footer.tsx";
import { ScrollToTop } from "../components/ScrollToTop";

export function MainLayout() {
    return (
        <div className="appShell">
            <Header />
            <ScrollToTop />
            <main className="main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}