import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getUserTrips, updateUserTrip } from "../features/trips/repo";
import type { Trip } from "../features/trips/types";
import { createOfferSchema, tripTypes, type CreateOfferForm } from "../features/trips/schemas";
import { FormError } from "../components/forms/FormError";

export function EditOfferPage() {
    const { tripId } = useParams();
    const nav = useNavigate();

    const trip = useMemo(() => {
        return getUserTrips().find((t) => t.id === tripId) ?? null;
    }, [tripId]);

    const form = useForm<CreateOfferForm>({
        resolver: zodResolver(createOfferSchema) as any,
        defaultValues: {
            title: "",
            location: "",
            country: "",
            type: "Training",
            startDate: "",
            endDate: "",
            priceCzk: 17000,
            capacity: 8,
            highlightsText: "",
            description: "",
        },
        mode: "onBlur",
    });

    useEffect(() => {
        if (!trip) return;
        form.reset({
            title: trip.title,
            location: trip.location,
            country: trip.country ?? "",
            type: trip.type,
            startDate: trip.startDate,
            endDate: trip.endDate,
            priceCzk: trip.priceCzk,
            capacity: trip.capacity,
            highlightsText: (trip.highlights ?? []).join("\n"),
            description: trip.description ?? "",
        });
    }, [trip, form]);

    if (!trip) {
        return (
            <div className="container stack">
                <h1>Edit offer</h1>
                <p className="muted">Tuhle nabídku nelze upravit (neexistuje nebo není v LocalStorage).</p>
                <Link to="/dashboard">← Zpět na Dashboard</Link>
            </div>
        );
    }

    const onSubmit = (values: CreateOfferForm) => {
        const parsedHighlights = values.highlightsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

        const updated: Trip = {
            ...trip,
            title: values.title.trim(),
            location: values.location.trim(),
            country: values.country.trim() || "—",
            type: values.type,
            startDate: values.startDate,
            endDate: values.endDate,
            priceCzk: values.priceCzk,
            capacity: values.capacity,
            highlights: parsedHighlights.length ? parsedHighlights : trip.highlights ?? [],
            description: values.description.trim() || "—",
            // ownerUserId se zachová díky ...trip
        };

        updateUserTrip(updated);
        nav(`/trips/${trip.id}`);
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form;

    return (
        <div className="container stack">
            <h1>Upravit nabídku</h1>

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
                        <input {...register("country")} />
                    </label>
                </div>

                <label className="field">
                    <span>Typ</span>
                    <select {...register("type")}>
                        {tripTypes.map((t) => (
                            <option key={t} value={t}>
                                {t}
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
                    <span>Souhrn</span>
                    <textarea rows={4} {...register("highlightsText")} />
                </label>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button className="btn" type="submit" disabled={isSubmitting}>
                        Uložit
                    </button>
                    <Link to={`/trips/${trip.id}`}>Zrušit</Link>
                </div>
            </form>
        </div>
    );
}