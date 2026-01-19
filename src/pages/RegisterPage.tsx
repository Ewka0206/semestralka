import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterForm } from "../features/auth/schemas";
import { addUser, findUserByEmail, setSession } from "../features/auth/repo";
import type { User } from "../features/auth/types";
import { FormError } from "../components/forms/FormError";

function uid(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function RegisterPage() {
    const nav = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", role: "crew" },
        mode: "onBlur",
    });

    const onSubmit = (values: RegisterForm) => {
        const normalizedEmail = values.email.trim().toLowerCase();
        if (findUserByEmail(normalizedEmail)) {
            setError("email", { type: "manual", message: "Uživatel s tímto emailem už existuje." });
            return;
        }
        const now = new Date().toISOString();

        const user: User = {
            id: uid(),
            name: values.name.trim(),
            email: normalizedEmail,
            password: values.password,
            role: values.role,
            createdAt: now,
            updatedAt: now,
        };

        addUser(user);
        setSession({ userId: user.id, createdAt: new Date().toISOString() });
        nav("/dashboard");
    };

    return (
        <div className="container stack">
            <h1>Registrace</h1>

            <form className="card stack" onSubmit={handleSubmit(onSubmit)}>
                <label className="field">
                    <span>Jméno</span>
                    <input {...register("name")} />
                    <FormError error={errors.name} />
                </label>

                <label className="field">
                    <span>Email</span>
                    <input {...register("email")} />
                    <FormError error={errors.email} />
                </label>

                <label className="field">
                    <span>Role</span>
                    <select {...register("role")}>
                        <option value="crew">Člen posádky</option>
                        <option value="captain">Kapitán</option>
                    </select>
                    <FormError error={errors.role as any} />
                </label>

                <label className="field">
                    <span>Heslo</span>
                    <input type="password" {...register("password")} />
                    <FormError error={errors.password} />
                </label>

                <button className="btn" type="submit" disabled={isSubmitting}>
                    Vytvořit účet
                </button>

                <p className="muted">
                    Už máš účet? Přihlas se zde:  <Link to="/login">Přihlásit se</Link>
                </p>
            </form>
        </div>
    );
}