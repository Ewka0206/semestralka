import { NavLink } from "react-router-dom";

export function Header() {
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
                    <NavLink to="/offers/new" className={({ isActive }) => (isActive ? "active" : "")}>
                        Create offer
                    </NavLink>
                    <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                        Login
                    </NavLink>
                    <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
                        Register
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}
