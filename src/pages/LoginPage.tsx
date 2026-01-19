import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginForm } from "../features/auth/schemas";
import { addUser, findUserByEmail, setSession } from "../features/auth/repo";
import type { User } from "../features/auth/types";
import { FormError } from "../components/forms/FormError";

function uid(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function LoginPage() {
    const nav = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
        mode: "onBlur",
    });

    const onSubmit = (values: LoginForm) => {
        const normalizedEmail = values.email.trim().toLowerCase();
        const existing = findUserByEmail(normalizedEmail);

        const user: User =
            existing ??
            (() => {
                const created: User = {
                    id: uid(),
                    email: normalizedEmail,
                    password: values.password,
                    name: normalizedEmail.split("@")[0] || "User",
                    role: "crew",
                    createdAt: new Date().toISOString(),
                };
                addUser(created);
                return created;
            })();

        if (existing && user.password !== values.password) {
            setError("password", { type: "manual", message: "Špatné heslo." });
            return;
        }

        setSession({ userId: user.id, createdAt: new Date().toISOString() });
        nav("/dashboard");
    };

    return (
        <div className="container stack">
            <h1>Login</h1>

            <form className="card stack" onSubmit={handleSubmit(onSubmit)}>
                <label className="field">
                    <span>Email</span>
                    <input {...register("email")} />
                    <FormError error={errors.email} />
                </label>

                <label className="field">
                    <span>Password</span>
                    <input type="password" {...register("password")} />
                    <FormError error={errors.password} />
                </label>

                <button className="btn" type="submit" disabled={isSubmitting}>
                    Login
                </button>

                <p className="muted">
                    Chceš radši plnou registraci? <Link to="/register">Register</Link>
                </p>
            </form>
        </div>
    );
}
