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
    const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="container stack">
            <div className="card profileHeader">
                <div className="profileAvatar">{initials}</div>
                <div className="profileInfo">
                    <p className="sectionTitle">Můj profil</p>
                    <h1 className="dashName">{user.name}</h1>
                    <p className="muted dashRole">⚓ {roleLabel} · {user.email}</p>
                </div>
                <div className="profileActions">
                    <Link className="btn" to="/me/edit">Upravit profil</Link>
                </div>
            </div>

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
