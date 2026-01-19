export function Footer() {
    return (
        <footer className="footer">
            <div className="container footerRow">
                <span>© {new Date().getFullYear()} Sail Connect</span>
                <span className="muted">Semestrální práce – frontend (React)</span>
            </div>
        </footer>
    );
}