import { Outlet } from "react-router-dom";
import { Header } from "./Header.tsx";
import { Footer } from "./Footer.tsx";

export function MainLayout() {
    return (
        <div className="appShell">
            <Header />
            <main className="main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}