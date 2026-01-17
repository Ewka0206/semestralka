import { Link } from "react-router-dom";

export function NotFoundPage() {
    return (
        <div className="container stack">
            <h1>404</h1>
            <p className="muted">Tahle stránka neexistuje.</p>
            <Link to="/">Zpět na Discover</Link>
        </div>
    );
}
