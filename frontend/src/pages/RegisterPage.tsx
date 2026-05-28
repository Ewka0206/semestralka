import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterForm } from "../features/auth/schemas";
import { register as registerUser } from "../features/auth/repo";
import { FormError } from "../components/forms/FormError";

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

    const onSubmit = async (values: RegisterForm) => {
        try {
            await registerUser({
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                password: values.password,
                role: values.role,
            });
            nav("/dashboard");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "";
            if (msg.includes("already exists") || msg.includes("409")) {
                setError("email", { type: "manual", message: "Uživatel s tímto emailem už existuje." });
            } else {
                setError("email", { type: "manual", message: "Registrace se nezdařila." });
            }
        }
    };

    return (
        <div className="authPage">
            <div className="authCard card stack">
                <div className="authBrand">
                    <span className="authIcon">⚓</span>
                    <span className="authBrandName">SailConnect</span>
                </div>

                <div className="authHeading">
                    <h1 className="authTitle">Registrace</h1>
                    <p className="muted">Vytvoř si účet a vypluj na moře</p>
                </div>

                <form className="stack" onSubmit={handleSubmit(onSubmit)}>
                    <label className="field">
                        <span>Jméno</span>
                        <input {...register("name")} placeholder="Např. Eva Kratěnová" autoComplete="name" />
                        <FormError error={errors.name} />
                    </label>

                    <label className="field">
                        <span>Email</span>
                        <input {...register("email")} placeholder="kapitan@moře.cz" autoComplete="email" />
                        <FormError error={errors.email} />
                    </label>

                    <label className="field">
                        <span>Role</span>
                        <select {...register("role")}>
                            <option value="crew">⛵ Člen posádky</option>
                            <option value="captain">🧭 Kapitán</option>
                        </select>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <FormError error={errors.role as any} />
                    </label>

                    <label className="field">
                        <span>Heslo</span>
                        <input type="password" {...register("password")} placeholder="••••••••" autoComplete="new-password" />
                        <FormError error={errors.password} />
                    </label>

                    <button className="btn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Vytvářím účet…" : "Vytvořit účet"}
                    </button>
                </form>

                <p className="muted authSwitch">
                    Už máš účet?{" "}
                    <Link to="/login">Přihlásit se</Link>
                </p>
            </div>
        </div>
    );
}
