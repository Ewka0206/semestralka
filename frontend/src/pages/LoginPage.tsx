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
        <div className="authPage">
            <div className="authCard card stack">
                <div className="authBrand">
                    <span className="authIcon">⚓</span>
                    <span className="authBrandName">SailConnect</span>
                </div>

                <div className="authHeading">
                    <h1 className="authTitle">Přihlášení</h1>
                    <p className="muted">Pokračuj ve svých námořních dobrodružstvích</p>
                </div>

                <form className="stack" onSubmit={handleSubmit(onSubmit)}>
                    <label className="field">
                        <span>Email</span>
                        <input {...register("email")} placeholder="kapitan@moře.cz" autoComplete="email" />
                        <FormError error={errors.email} />
                    </label>

                    <label className="field">
                        <span>Heslo</span>
                        <input type="password" {...register("password")} placeholder="••••••••" autoComplete="current-password" />
                        <FormError error={errors.password} />
                    </label>

                    <button className="btn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Přihlašuji…" : "Přihlásit se"}
                    </button>
                </form>

                <p className="muted authSwitch">
                    Ještě nemáš účet?{" "}
                    <Link to="/register">Zaregistruj se</Link>
                </p>
            </div>
        </div>
    );
}
