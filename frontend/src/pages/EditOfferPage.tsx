import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getTripById, updateUserTrip } from "../features/trips/repo";
import type { Trip } from "../features/trips/types";
import { createOfferSchema, type CreateOfferForm } from "../features/trips/schemas";
import { useTripTypes } from "../features/trips/useTripTypes";
import { FormError } from "../components/forms/FormError";
import { ImageUpload } from "../components/forms/ImageUpload";

export function EditOfferPage() {
    const { tripId } = useParams();
    const nav = useNavigate();
    const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
    const tripTypes = useTripTypes();

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
        if (!tripId) { setTrip(null); return; }
        getTripById(tripId).then((t) => {
            setTrip(t);
            if (t) {
                form.reset({
                    title: t.title,
                    location: t.location,
                    country: t.country ?? "",
                    type: t.type,
                    startDate: t.startDate,
                    endDate: t.endDate,
                    priceCzk: t.priceCzk,
                    capacity: t.capacity,
                    highlightsText: (t.highlights ?? []).join("\n"),
                    description: t.description ?? "",
                });
            }
        });
    }, [tripId]);

    if (trip === undefined) {
        return <div className="container stack"><p className="muted">Načítám...</p></div>;
    }

    if (!trip) {
        return (
            <div className="container stack">
                <h1>Edit offer</h1>
                <p className="muted">Tuhle nabídku nelze upravit (neexistuje nebo není dostupná).</p>
                <Link to="/dashboard">← Zpět na Dashboard</Link>
            </div>
        );
    }

    const onSubmit = async (values: CreateOfferForm) => {
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
            imageUrl: values.imageUrl?.trim() ? values.imageUrl.trim() : undefined,
        };

        await updateUserTrip(updated);
        nav(`/trips/${trip.id}`);
    };

    const {
        register,
        handleSubmit,
        watch,
        setValue,
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
                            <option key={t.code} value={t.code}>
                                {t.label}
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

                <div className="field">
                    <span>Obrázek</span>
                    <ImageUpload
                        value={watch("imageUrl") ?? trip.imageUrl ?? ""}
                        onChange={(url) => setValue("imageUrl", url)}
                    />
                </div>

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
