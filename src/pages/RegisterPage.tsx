import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { User, UserRole } from "../features/auth/types";
import { addUser, findUserByEmail, setSession } from "../features/auth/repo";

function uid(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function RegisterPage() {
    const nav = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<UserRole>("crew");
    const [password, setPassword] = useState("");

    function submit() {
        if (!name.trim()) return alert("Vyplň jméno.");
        if (!email.includes("@")) return alert("Zadej validní email.");
        if (password.length < 4) return alert("Heslo aspoň 4 znaky.");
        if (findUserByEmail(email)) return alert("Uživatel s tímto emailem už existuje.");

        const user: User = {
            id: uid(),
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            createdAt: new Date().toISOString(),
        };

        addUser(user);
        setSession({ userId: user.id, createdAt: new Date().toISOString() });
        nav("/dashboard");
    }

    return (
        <div className="container stack">
            <h1>Register</h1>

            <section className="card stack">
                <label className="field">
                    <span>Name</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} />
                </label>

                <label className="field">
                    <span>Email</span>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label className="field">
                    <span>Role</span>
                    <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                        <option value="crew">Crew</option>
                        <option value="captain">Captain</option>
                    </select>
                </label>

                <label className="field">
                    <span>Password</span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>

                <button className="btn" type="button" onClick={submit}>
                    Create account
                </button>

                <p className="muted">
                    Už máš účet? <Link to="/login">Login</Link>
                </p>
            </section>
        </div>
    );
}