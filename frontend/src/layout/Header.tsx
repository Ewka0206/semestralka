import { useEffect, useState } from "react";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import { userRoleLabels } from "../features/auth/i18n";
import { useAuth } from "../features/auth/AuthContext";

export function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const [isOpen, setIsOpen] = useState(false);

    function handleLogout() {
        logout();
        setIsOpen(false);
        navigate("/");
    }

    useEffect(() => {
        // Záměrné: zavření hamburger menu při změně routy
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(false);
    }, [location.pathname]);

    const isCaptain = user?.role === "captain";

    return (
        <header className="header">
            <div className="container headerRow">
                <Link to="/" className="brandLink" aria-label="Jít na úvod">
                    <img
                        className="brandLogo"
                        src="/images/logo.png"
                        alt="Sail Connect"
                    />
                    <span className="brandText">Sail Connect</span>
                </Link>

                {/* Burger jen pro mobil */}
                <button
                    className="burger"
                    type="button"
                    aria-label={isOpen ? "Zavřít menu" : "Otevřít menu"}
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((v) => !v)}
                >
                    <span className="burgerLine" />
                    <span className="burgerLine" />
                    <span className="burgerLine" />
                </button>

                <nav className={`nav ${isOpen ? "navOpen" : ""}`}>
                    <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                        Domů
                    </NavLink>

                    {/* Přihlášený uživatel – libovolná role */}
                    {user && (
                        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                            Můj přehled
                        </NavLink>
                    )}

                    {/* Pouze kapitán */}
                    {isCaptain && (
                        <NavLink to="/offers/new" className={({ isActive }) => (isActive ? "active" : "")}>
                            Vytvořit plavbu
                        </NavLink>
                    )}

                    {user ? (
                        <>
                            <NavLink to="/me" className={({ isActive }) => (isActive ? "active" : "")}>
                                {user.name} ({userRoleLabels[user.role]})
                            </NavLink>

                            <button className="btnLogout" type="button" onClick={handleLogout}>
                                Odhlášení
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                                Přihlášení
                            </NavLink>
                            <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
                                Registrace
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
