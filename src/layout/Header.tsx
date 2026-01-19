// ...imports
import { NavLink, useNavigate } from "react-router-dom";
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
                <div className="brand">
                    <span className="brandMark">⛵</span>
                    <span className="brandText">Sail Connect</span>
                </div>

                <nav className="nav">
                    <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                        Discover
                    </NavLink>

                    <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                        Dashboard
                    </NavLink>

                    {/* ✅ VŽDY viditelné */}
                    <NavLink to="/offers/new" className={({ isActive }) => (isActive ? "active" : "")}>
                        Create offer
                    </NavLink>

                    {user ? (
                        <>
              <span className="muted" style={{ padding: "6px 10px" }}>
                {user.name} ({user.role})
              </span>
                            <button className="btn" type="button" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                                Login
                            </NavLink>
                            <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
                                Register
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}