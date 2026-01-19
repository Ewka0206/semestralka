import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Trip } from "../features/trips/types";
import { addUserTrip } from "../features/trips/repo";
import { createOfferSchema, tripTypes, type CreateOfferForm } from "../features/trips/schemas";
import { FormError } from "../components/forms/FormError";
import { getCurrentUser } from "../features/auth/repo";
import { tripTypeLabels } from "../features/trips/i18n";

function uid(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function CreateOfferPage() {
    const nav = useNavigate();
    const user = getCurrentUser();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateOfferForm>({
        resolver: zodResolver(createOfferSchema) as any,
        defaultValues: {
            title: "",
            location: "",
            country: "",
            type: "Relax",
            startDate: "",
            endDate: "",
            priceCzk: 17000,
            capacity: 8,
            highlightsText: "",
            description: "",
        },
        mode: "onBlur",
    });

    const onSubmit = (values: CreateOfferForm) => {
        const parsedHighlights = values.highlightsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

        const highlights =
            parsedHighlights.length > 0 ? parsedHighlights : ["New offer", "Custom route", "Friendly crew"];

        const trip: Trip = {
            id: uid(),
            title: values.title.trim(),
            location: values.location.trim(),
            country: values.country.trim() || "—",
            type: values.type,
            startDate: values.startDate,
            endDate: values.endDate,
            priceCzk: values.priceCzk,
            capacity: values.capacity,

            booked: 0,
            skipperIncluded: true,
            highlights,
            description: values.description.trim() || "—",

            ownerUserId: user?.id,
        };

        addUserTrip(trip);
        nav(`/trips/${trip.id}`);
    };

    return (
        <div className="container stack">
            <h1>Vytvořit nabídku</h1>

            <form className="card stack" onSubmit={handleSubmit(onSubmit)}>
                <label className="field">
                    <span>Název</span>
                    <input {...register("title")} />
                    <FormError error={errors.title} />
                </label>

                <div className="grid2">
                    <label className="field">
                        <span>Destinace</span>
                        <input {...register("location")} />
                        <FormError error={errors.location} />
                    </label>

                    <label className="field">
                        <span>Stát</span>
                        <input {...register("country")} placeholder="Řecko" />
                    </label>
                </div>

                <label className="field">
                    <span>Typ</span>
                    <select {...register("type")}>
                        {tripTypes.map((t) => (
                            <option key={t} value={t}>
                                {tripTypeLabels[t]} {}
                            </option>
                        ))}
                    </select>
                    <FormError error={errors.type as any} />
                </label>

                <div className="grid2">
                    <label className="field">
                        <span>Datum od</span>
                        <input type="date" {...register("startDate")} />
                        <FormError error={errors.startDate} />
                    </label>

                    <label className="field">
                        <span>Datum do</span>
                        <input type="date" {...register("endDate")} />
                        <FormError error={errors.endDate} />
                    </label>
                </div>

                <div className="grid2">
                    <label className="field">
                        <span>Cena (CZK)</span>
                        <input type="number" min={0} {...register("priceCzk")} />
                        <FormError error={errors.priceCzk} />
                    </label>

                    <label className="field">
                        <span>Počet míst</span>
                        <input type="number" min={1} {...register("capacity")} />
                        <FormError error={errors.capacity} />
                    </label>
                </div>

                <label className="field">
                    <span>Detail</span>
                    <textarea rows={4} {...register("description")} />
                </label>

                <label className="field">
                    <span>Souhrn (1 bod na řádek)</span>
                    <textarea rows={4} {...register("highlightsText")} />
                </label>

                <button className="btn" type="submit" disabled={isSubmitting}>
                    Uložit
                </button>
            </form>
        </div>
    );
}