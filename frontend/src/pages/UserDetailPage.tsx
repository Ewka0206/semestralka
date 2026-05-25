import { Link} from "react-router-dom";
import { getCurrentUser} from "../features/auth/repo";
import { userRoleLabels } from "../features/auth/i18n";

export function UserDetailPage() {
    const user = getCurrentUser();

    if (!user) {
        return (
            <div className="container stack">
                <h1>Můj profil</h1>
                <p className="muted">Nejsi přihlášená.</p>
                <Link className="btn" to="/login">
                    Přihlásit se
                </Link>
            </div>
        );
    }

    const lastChange = user.updatedAt || user.createdAt;

   return (
        <div className="container stack">
            <h1>Můj profil</h1>

            <section className="card stack">
                <div>
                    <span className="muted">Jméno</span>
                    <div><strong>{user.name}</strong></div>
                </div>

                {"email" in user && user.email ? (
                    <div>
                        <span className="muted">Email</span>
                        <div>{(user as any).email}</div>
                    </div>
                ) : null}

                <div>
                    <span className="muted">Role</span>
                    <div>{userRoleLabels[user.role]}</div>
                </div>

                <div>
                    <span className="muted">Datum registrace</span>
                    <div>{new Date(user.createdAt).toLocaleString()}</div>
                </div>

                <div>
                    <span className="muted">Poslední změna</span>
                    <div>{new Date(lastChange).toLocaleString()}</div>
                </div>

                <div className="actionsRow">
                    <Link className="btn" to="/me/edit">
                        Upravit profil
                    </Link>
                </div>

            </section>
        </div>
    );
}