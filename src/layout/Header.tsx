// ...imports
import { NavLink, useNavigate , Link} from "react-router-dom";
import { logout, getCurrentUser } from "../features/auth/repo";

export function Header() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <header className="header">
            <div className="container headerRow">
                <Link to="/" className="brandLink" aria-label="Go to Discover">
                    <span className="brandMark">⛵</span>
                    <span className="brandText">Sail Connect</span>
                </Link>

                <nav className="nav">
                    <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                        Domů
                    </NavLink>

                    <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                        Můj přehled
                    </NavLink>

                    <NavLink to="/offers/new" className={({ isActive }) => (isActive ? "active" : "")}>
                        Vytvořit nabídku
                    </NavLink>

                    {user ? (
                        <>
                    <NavLink className="nav" to="/me">
                        {user.name} ({user.role})
                    </NavLink>

                    <button className="btn" type="button" onClick={handleLogout}>
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