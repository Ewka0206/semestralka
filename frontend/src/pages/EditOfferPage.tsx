import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getTripById, updateUserTrip } from "../features/trips/repo";
import type { Trip } from "../features/trips/types";
import { createOfferSchema, type CreateOfferForm } from "../features/trips/schemas";
import { useTripTypes } from "../features/trips/useTripTypes";
import { useCountries } from "../features/trips/useCountries";
import { FormError } from "../components/forms/FormError";
import { ImageUpload } from "../components/forms/ImageUpload";
import { NotFoundPage } from "./NotFoundPage";

export function EditOfferPage() {
    const { tripId } = useParams();
    const nav = useNavigate();
    const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
    const [apiError, setApiError] = useState<string | null>(null);
    const tripTypes = useTripTypes();
    const countries = useCountries();

    const form = useForm<CreateOfferForm>({
        resolver: zodResolver(createOfferSchema) as any,
        defaultValues: {
            title: "", location: "", country: "", type: "Training",
            startDate: "", endDate: "", priceCzk: 17000, capacity: 8,
            highlightsText: "", description: "",
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
                    imageUrl: t.imageUrl ?? "",
                });
            }
        });
    }, [tripId]);

    if (trip === undefined) return <div className="container stack"><p className="muted">Načítám...</p></div>;
    if (!trip) return <NotFoundPage />;

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;

    const onSubmit = async (values: CreateOfferForm) => {
        setApiError(null);
        try {
            const parsedHighlights = values.highlightsText
                .split("\n").map((s) => s.trim()).filter(Boolean);

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
        } catch {
            setApiError("Nepodařilo se uložit změny. Zkuste to znovu.");
        }
    };

    return (
        <div className="container stack">

            {/* ── Dekorativní hero pruh ── */}
            <div className="formHeroStrip">
                <div>
                    <p className="sectionTitle">Upravit plavbu</p>
                    <h1>{trip.title}</h1>
                </div>
            </div>

            <form className="card stack" onSubmit={handleSubmit(onSubmit)}>

                <label className="field">
                    <span>Název plavby</span>
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
                        <select {...register("country")}>
                            <option value="">— vyberte stát —</option>
                            {countries.map((c) => (
                                <option key={c.code} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <label className="field">
                    <span>Typ plavby</span>
                    <select {...register("type")}>
                        {tripTypes.map((t) => (
                            <option key={t.code} value={t.code}>{t.label}</option>
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
                        <span>Cena (Kč / osoba)</span>
                        <input type="number" min={0} {...register("priceCzk")} />
                        <FormError error={errors.priceCzk} />
                    </label>
                    <label className="field">
                        <span>Kapacita (počet míst)</span>
                        <input type="number" min={1} {...register("capacity")} />
                        <FormError error={errors.capacity} />
                    </label>
                </div>

                <label className="field">
                    <span>Popis plavby</span>
                    <textarea rows={4} {...register("description")} />
                </label>

                <label className="field">
                    <span>Highlights (1 bod na řádek)</span>
                    <textarea rows={4} {...register("highlightsText")} />
                </label>

                <div className="field">
                    <span>Obrázek</span>
                    <ImageUpload
                        value={watch("imageUrl") ?? trip.imageUrl ?? ""}
                        onChange={(url) => setValue("imageUrl", url)}
                    />
                </div>

                {apiError && <p className="formError">{apiError}</p>}

                <div className="actionsRow">
                    <button className="btn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Ukládám…" : "Uložit změny"}
                    </button>
                    <Link className="btn btnOutline" to={`/trips/${trip.id}`}>
                        Zrušit
                    </Link>
                </div>
            </form>
        </div>
    );
}
