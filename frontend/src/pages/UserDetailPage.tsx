import { Link } from "react-router-dom";
import { getCurrentUser } from "../features/auth/repo";
import { userRoleLabels } from "../features/auth/i18n";

export function UserDetailPage() {
    const user = getCurrentUser();

    if (!user) {
        return (
            <div className="authPage">
                <div className="authCard card stack">
                    <div className="authBrand"><span className="authIcon">⚓</span><span className="authBrandName">SailConnect</span></div>
                    <p className="muted" style={{ textAlign: "center" }}>Nejsi přihlášen/a.</p>
                    <Link className="btn" to="/login">Přihlásit se</Link>
                </div>
            </div>
        );
    }

    const roleLabel = userRoleLabels[user.role];
    const roleIcon  = user.role === "captain" ? "⛵" : "🧑‍✈️";
    const initials  = user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
    const memberSince = new Date(user.createdAt).toLocaleDateString("cs-CZ", { year: "numeric", month: "long" });
    const daysSince = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000);

    return (
        <div className="container stack">

            {/* ── Hlavička profilu ── */}
            <div className="card profileHeader">
                <div className="profileAvatar">{initials}</div>
                <div className="profileInfo">
                    <p className="sectionTitle">Můj profil</p>
                    <h1 className="dashName">{user.name}</h1>
                </div>
                <div className="profileActions">
                    <Link className="btn" to="/me/edit">Upravit profil</Link>
                </div>
            </div>

            {/* ── Stat karty ── */}
            <div className="statGrid">
                <div className="statCard">
                    <span className="statCardIcon">{roleIcon}</span>
                    <span className="statCardNum" style={{ fontSize: "1rem", paddingTop: 4 }}>{roleLabel}</span>
                    <p className="statCardLabel">Role</p>
                </div>
                <div className="statCard">
                    <span className="statCardIcon">📅</span>
                    <span className="statCardNum" style={{ fontSize: "1rem", paddingTop: 4 }}>{memberSince}</span>
                    <p className="statCardLabel">Člen od</p>
                </div>
                <div className="statCard">
                    <span className="statCardIcon">⚓</span>
                    <span className="statCardNum">{daysSince}</span>
                    <p className="statCardLabel">Dní na palubě</p>
                </div>
            </div>

            {/* ── Detailní údaje ── */}
            <section className="card stack">
                <h2 className="dashSectionTitle">Údaje účtu</h2>
                <div className="profileRows">
                    <div className="profileRow">
                        <span className="muted">Jméno</span>
                        <strong>{user.name}</strong>
                    </div>
                    <div className="profileRow">
                        <span className="muted">Email</span>
                        <span>{user.email}</span>
                    </div>
                    <div className="profileRow">
                        <span className="muted">Role</span>
                        <span>{roleLabel}</span>
                    </div>
                    <div className="profileRow">
                        <span className="muted">Registrace</span>
                        <span>{new Date(user.createdAt).toLocaleDateString("cs-CZ")}</span>
                    </div>
                    <div className="profileRow">
                        <span className="muted">Poslední změna</span>
                        <span>{new Date(user.updatedAt || user.createdAt).toLocaleDateString("cs-CZ")}</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
