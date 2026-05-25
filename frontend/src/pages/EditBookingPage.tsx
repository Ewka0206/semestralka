import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { bookingSchema, type BookingForm } from "../features/bookings/schemas";
import { getBookingById, updateBooking } from "../features/bookings/repo";
import { getTripById } from "../features/trips/repo";
import { FormError } from "../components/forms/FormError";
import type { Booking } from "../features/bookings/types";
import type { Trip } from "../features/trips/types";
import { NotFoundPage } from "./NotFoundPage";

export function EditBookingPage() {
    const { bookingId } = useParams();
    const nav = useNavigate();

    const [booking, setBooking] = useState<Booking | null | undefined>(undefined);
    const [trip, setTrip] = useState<Trip | null>(null);

    const form = useForm<BookingForm>({
        resolver: zodResolver(bookingSchema) as any,
        mode: "onBlur",
    });

    useEffect(() => {
        if (!bookingId) { setBooking(null); return; }
        getBookingById(bookingId).then((b) => {
            setBooking(b);
            if (b) {
                form.reset({ contactName: b.contactName, contactEmail: b.contactEmail, seats: b.seats });
                getTripById(b.tripId).then(setTrip);
            }
        });
    }, [bookingId]);

    if (booking === undefined) {
        return <div className="container stack"><p className="muted">Načítám...</p></div>;
    }

    if (!booking) {
        return <NotFoundPage />;
    }

    const onSubmit = async (values: BookingForm) => {
        if (trip && values.seats > trip.capacity) {
            form.setError("seats", { type: "manual", message: "Počet míst je mimo kapacitu plavby." });
            return;
        }

        const updated: Booking = {
            ...booking,
            contactName: values.contactName.trim(),
            contactEmail: values.contactEmail.trim(),
            seats: values.seats,
        };

        await updateBooking(updated);
        nav(`/bookings/${booking.id}`);
    };

    const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

    return (
        <div className="container stack">
            <h1>Upravit rezervaci</h1>

            <section className="card stack">
                <div className="muted">
                    Plavba: <strong>{trip?.title ?? booking.tripId}</strong>
                </div>

                <form className="stack" onSubmit={handleSubmit(onSubmit)}>
                    <label className="field">
                        <span>Jméno</span>
                        <input {...register("contactName")} />
                        <FormError error={errors.contactName} />
                    </label>

                    <label className="field">
                        <span>Email</span>
                        <input {...register("contactEmail")} />
                        <FormError error={errors.contactEmail} />
                    </label>

                    <label className="field">
                        <span>Počet míst</span>
                        <input type="number" min={1} max={trip?.capacity ?? undefined} {...register("seats")} />
                        <FormError error={errors.seats} />
                    </label>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <button className="btn" type="submit" disabled={isSubmitting}>Uložit</button>
                        <Link className="btn" to="/dashboard">Zrušit</Link>
                    </div>
                </form>
            </section>
        </div>
    );
}
