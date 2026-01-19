import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { UserRole } from "../features/auth/types";
import { getCurrentUser, updateCurrentUser } from "../features/auth/repo";
import { userRoleLabels } from "../features/auth/i18n";
import { FormError } from "../components/forms/FormError";

const roles: UserRole[] = ["crew", "captain"];

const editUserSchema = z.object({
    name: z.string().trim().min(2, "Jméno musí mít aspoň 2 znaky."),
    email: z.string().trim().email("Zadej platný email."),
    role: z.enum(["crew", "captain"]),
});

type EditUserForm = z.infer<typeof editUserSchema>;

export function EditUserPage() {
    const nav = useNavigate();
    const user = getCurrentUser();

    const form = useForm<EditUserForm>({
        resolver: zodResolver(editUserSchema),
        defaultValues: { name: "", email: "", role: "crew" },
        mode: "onBlur",
    });

    useEffect(() => {
        if (!user) return;
        form.reset({
            name: user.name ?? "",
            email: user.email ?? "",
            role: user.role,
        });
    }, [user, form]);

    if (!user) {
        return (
            <div className="container stack">
                <h1>Upravit profil</h1>
                <p className="muted">Nejsi přihlášená.</p>
                <Link className="btn" to="/login">
                    Přihlásit se
                </Link>
            </div>
        );
    }

    const onSubmit = (values: EditUserForm) => {
        updateCurrentUser({
            name: values.name.trim(),
            email: values.email.trim(),
            role: values.role,
            // updatedAt se nastaví v updateCurrentUser()
        });

        nav("/me");
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form;

    return (
        <div className="container stack">
            <h1>Upravit profil</h1>

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
                            <option key={r} value={r}>
                                {userRoleLabels[r]}
                            </option>
                        ))}
                    </select>
                    <FormError error={errors.role} />
                </label>

                <div className="actionsRow">
                    <button className="btn" type="submit" disabled={isSubmitting}>
                        Uložit změny
                    </button>

                    <Link className="btn" to="/me">
                        Zrušit
                    </Link>
                </div>
            </form>
        </div>
    );
}