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
        } catch (e: any) {
            if (e.message?.includes("already exists") || e.message?.includes("409")) {
                setError("email", { type: "manual", message: "Uživatel s tímto emailem už existuje." });
            } else {
                setError("email", { type: "manual", message: "Registrace se nezdařila." });
            }
        }
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
                    Už máš účet? Přihlas se zde: <Link to="/login">Přihlásit se</Link>
                </p>
            </form>
        </div>
    );
}
