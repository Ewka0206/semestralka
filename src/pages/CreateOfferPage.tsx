import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Trip } from "../features/trips/types";
import { addUserTrip } from "../features/trips/repo";
import { createOfferSchema, tripTypes, type CreateOfferForm } from "../features/trips/schemas";
import { FormError } from "../components/forms/FormError";

function uid(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function CreateOfferPage() {
    const nav = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateOfferForm>({
        resolver: zodResolver(createOfferSchema),
        defaultValues: {
            type: "Training",
            priceCzk: 17000,
            capacity: 8,
            highlightsText: "",
            description: "",
            country: "",
        },
        mode: "onBlur",
    });

    const onSubmit = (values: CreateOfferForm) => {
        const parsedHighlights = (values.highlightsText ?? "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

        const highlights =
            parsedHighlights.length > 0
                ? parsedHighlights
                : ["New offer", "Custom route", "Friendly crew"];

        const trip: Trip = {
            id: uid(),
            title: values.title.trim(),
            location: values.location.trim(),
            country: values.country?.trim() || "—",
            type: values.type,
            startDate: values.startDate,
            endDate: values.endDate,
            priceCzk: values.priceCzk,
            capacity: values.capacity,

            booked: 0,
            skipperIncluded: true,
            highlights,

            description: values.description?.trim() || "—",
        };

        addUserTrip(trip);
        nav(`/trips/${trip.id}`);
    };

    return (
        <div className="container stack">
            <h1>Create offer</h1>

            <form className="card stack" onSubmit={handleSubmit(onSubmit)}>
                <label className="field">
                    <span>Title</span>
                    <input {...register("title")} />
                    <FormError error={errors.title} />
                </label>

                <div className="grid2">
                    <label className="field">
                        <span>Location</span>
                        <input {...register("location")} />
                        <FormError error={errors.location} />
                    </label>

                    <label className="field">
                        <span>Country</span>
                        <input {...register("country")} placeholder="Greece" />
                        <FormError error={errors.country as any} />
                    </label>
                </div>

                <label className="field">
                    <span>Type</span>
                    <select {...register("type")}>
                        {tripTypes.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                    <FormError error={errors.type} />
                </label>

                <div className="grid2">
                    <label className="field">
                        <span>Start date</span>
                        <input type="date" {...register("startDate")} />
                        <FormError error={errors.startDate} />
                    </label>

                    <label className="field">
                        <span>End date</span>
                        <input type="date" {...register("endDate")} />
                        <FormError error={errors.endDate} />
                    </label>
                </div>

                <div className="grid2">
                    <label className="field">
                        <span>Price (CZK)</span>
                        <input type="number" min={0} {...register("priceCzk")} />
                        <FormError error={errors.priceCzk} />
                    </label>

                    <label className="field">
                        <span>Capacity</span>
                        <input type="number" min={1} {...register("capacity")} />
                        <FormError error={errors.capacity} />
                    </label>
                </div>

                <label className="field">
                    <span>Highlights (1 per line)</span>
                    <textarea rows={4} {...register("highlightsText")} />
                    <FormError error={errors.highlightsText as any} />
                </label>

                <label className="field">
                    <span>Description</span>
                    <textarea rows={4} {...register("description")} />
                    <FormError error={errors.description as any} />
                </label>

                <button className="btn" type="submit" disabled={isSubmitting}>
                    Save offer
                </button>
            </form>
        </div>
    );
}