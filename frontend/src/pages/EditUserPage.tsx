import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { UserRole } from "../features/auth/types";
import { userRoleLabels } from "../features/auth/i18n";
import { FormError } from "../components/forms/FormError";
import { useAuth } from "../features/auth/AuthContext";

const roles: UserRole[] = ["crew", "captain"];

const editUserSchema = z.object({
    name:  z.string().trim().min(2, "Jméno musí mít aspoň 2 znaky."),
    email: z.string().trim().email("Zadej platný email."),
    role:  z.enum(["crew", "captain"]),
});
type EditUserForm = z.infer<typeof editUserSchema>;

export function EditUserPage() {
    const nav = useNavigate();
    const { user, updateUser } = useAuth();
    const initialized = useRef(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm<EditUserForm>({
        resolver: zodResolver(editUserSchema),
        defaultValues: { name: "", email: "", role: "crew" },
        mode: "onBlur",
        shouldUnregister: false,
    });

    const { reset } = form;

    useEffect(() => {
        if (!user || initialized.current) return;
        initialized.current = true;
        reset({ name: user.name ?? "", email: user.email ?? "", role: user.role });
    }, [user, reset]);

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

    const onSubmit = async (values: EditUserForm) => {
        setApiError(null);
        try {
            await updateUser({ name: values.name.trim(), email: values.email.trim(), role: values.role });
            nav("/me");
        } catch {
            setApiError("Nepodařilo se uložit změny. Zkuste to znovu.");
        }
    };

    const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

    return (
        <div className="container stack">

            {/* ── Dekorativní hero pruh ── */}
            <div className="formHeroStrip formHeroStrip--nordic">
                <div>
                    <p className="sectionTitle">Můj profil</p>
                    <h1>Upravit profil</h1>
                </div>
            </div>

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
                        {roles.map((r) => (
                            <option key={r} value={r}>{userRoleLabels[r]}</option>
                        ))}
                    </select>
                    <FormError error={errors.role} />
                </label>

                {apiError && <p className="formError">{apiError}</p>}

                <div className="actionsRow">
                    <button className="btn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Ukládám…" : "Uložit změny"}
                    </button>
                    <Link className="btn btnOutline" to="/me">Zrušit</Link>
                </div>
            </form>
        </div>
    );
}
