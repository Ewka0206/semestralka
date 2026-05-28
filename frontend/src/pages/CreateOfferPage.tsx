import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Trip } from "../features/trips/types";
import { addUserTrip } from "../features/trips/repo";
import { createOfferSchema, type CreateOfferForm } from "../features/trips/schemas";
import { FormError } from "../components/forms/FormError";
import { ImageUpload } from "../components/forms/ImageUpload";
import { getCurrentUser } from "../features/auth/repo";
import { useTripTypes } from "../features/trips/useTripTypes";
import { useCountries } from "../features/trips/useCountries";

export function CreateOfferPage() {
    const nav = useNavigate();
    const user = getCurrentUser();
    const tripTypes = useTripTypes();
    const countries = useCountries();

    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
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

    const onSubmit = async (values: CreateOfferForm) => {
        setApiError(null);
        try {
            const parsedHighlights = values.highlightsText
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);

            const highlights =
                parsedHighlights.length > 0 ? parsedHighlights : ["New offer", "Custom route", "Friendly crew"];

            const tripData: Omit<Trip, "id"> = {
                title: values.title.trim(),
                imageUrl: values.imageUrl?.trim() ? values.imageUrl.trim() : undefined,
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

            const created = await addUserTrip(tripData);
            nav(`/trips/${created.id}`);
        } catch {
            setApiError("Nepodařilo se uložit plavbu. Zkuste to znovu.");
        }
    };

    return (
        <div className="container stack">

            {/* ── Dekorativní hero pruh ── */}
            <div className="formHeroStrip">
                <div>
                    <p className="sectionTitle">Nová plavba</p>
                    <h1>Vytvořit plavbu</h1>
                </div>
            </div>

            <form className="card stack" onSubmit={handleSubmit(onSubmit)}>

                <label className="field">
                    <span>Název plavby</span>
                    <input {...register("title")} placeholder="Např. Korfu – rekreace na Jónském moři" />
                    <FormError error={errors.title} />
                </label>

                <div className="grid2">
                    <label className="field">
                        <span>Destinace</span>
                        <input {...register("location")} placeholder="Korfu" />
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
                    <textarea rows={4} {...register("description")} placeholder="Stručný popis itineráře, co čeká účastníky…" />
                </label>

                <label className="field">
                    <span>Highlights (1 bod na řádek)</span>
                    <textarea rows={4} {...register("highlightsText")} placeholder={"Ostrov Korfu\nPlavba přes Jónské moře\nZápad slunce v přístavu"} />
                </label>

                <div className="field">
                    <span>Obrázek</span>
                    <ImageUpload
                        value={watch("imageUrl") ?? ""}
                        onChange={(url) => setValue("imageUrl", url)}
                    />
                </div>

                {apiError && <p className="formError">{apiError}</p>}

                <button className="btn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Ukládám…" : "Uložit plavbu"}
                </button>
            </form>
        </div>
    );
}
