import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addUser, findUserByEmail, setSession } from "../features/auth/repo";
import type { User } from "../features/auth/types";

function uid(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function LoginPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function submit() {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail.includes("@")) return alert("Zadej validní email.");
        if (password.length < 4) return alert("Heslo aspoň 4 znaky.");

        const existing = findUserByEmail(normalizedEmail);

        // ✅ když user neexistuje, vytvoř ho automaticky
        const user: User =
            existing ??
            (() => {
                const created: User = {
                    id: uid(),
                    email: normalizedEmail,
                    password,
                    name: normalizedEmail.split("@")[0] || "User",
                    role: "crew", // default
                    createdAt: new Date().toISOString(),
                };
                addUser(created);
                return created;
            })();

        // pokud existuje, ověř heslo
        if (existing && user.password !== password) return alert("Špatné heslo.");

        setSession({ userId: user.id, createdAt: new Date().toISOString() });
        nav("/dashboard");
    }

    return (
        <div className="container stack">
            <h1>Login</h1>

            <section className="card stack">
                <label className="field">
                    <span>Email</span>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label className="field">
                    <span>Password</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                <button className="btn" type="button" onClick={submit}>
                    Login
                </button>

                <p className="muted">
                    Chceš radši plnou registraci? <Link to="/register">Register</Link>
                </p>
            </section>
        </div>
    );
}