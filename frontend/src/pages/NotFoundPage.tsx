import { Link, useLocation } from "react-router-dom";

export function NotFoundPage() {
    const { pathname } = useLocation();

    return (
        <div className="container stack">
            <h1>404 – Stránka nenalezena</h1>
            <p className="muted">
                Stránka <strong>{pathname}</strong> neexistuje nebo byla odstraněna.
            </p>
            <Link to="/">← Zpět na Domovskou stránku</Link>
        </div>
    );
}
