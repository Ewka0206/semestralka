import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginForm } from "../features/auth/schemas";
import { login } from "../features/auth/repo";
import { FormError } from "../components/forms/FormError";

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

    const onSubmit = async (values: LoginForm) => {
        try {
            await login(values.email.trim().toLowerCase(), values.password);
            nav("/dashboard");
        } catch {
            setError("password", { type: "manual", message: "Špatné přihlašovací údaje." });
        }
    };

    return (
        <div className="container stack">
            <h1>Přihlášení</h1>

            <form className="card stack" onSubmit={handleSubmit(onSubmit)}>
                <label className="field">
                    <span>Email</span>
                    <input {...register("email")} />
                    <FormError error={errors.email} />
                </label>

                <label className="field">
                    <span>Heslo</span>
                    <input type="password" {...register("password")} />
                    <FormError error={errors.password} />
                </label>

                <button className="btn" type="submit" disabled={isSubmitting}>
                    Přihlásit se
                </button>

                <p className="muted">
                    Ještě nemáš účet? Klikni zde: <Link to="/register">Registrace</Link>
                </p>
            </form>
        </div>
    );
}
