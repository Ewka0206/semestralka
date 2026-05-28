import { Link, useLocation } from "react-router-dom";

export function NotFoundPage() {
    const { pathname } = useLocation();

    return (
        <div className="notFoundPage">
            <div className="notFoundCard card stack">
                <div className="notFoundCode">404</div>
                <div className="notFoundIcon">⚓</div>
                <h1 className="notFoundTitle">Stránka nenalezena</h1>
                <p className="muted notFoundSub">
                    Cesta <code className="notFoundPath">{pathname}</code> neexistuje nebo byla odstraněna.
                </p>
                <Link className="btn" to="/">← Zpět na přehled plaveb</Link>
            </div>
        </div>
    );
}
