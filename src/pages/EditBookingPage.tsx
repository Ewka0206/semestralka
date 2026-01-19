import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { bookingSchema, type BookingForm } from "../features/bookings/schemas";
import { getBookingById, updateBooking } from "../features/bookings/repo";
import { getUserTrips } from "../features/trips/repo";
import { tripsMock } from "../data/tripsMock";
import { FormError } from "../components/forms/FormError";
import type { Booking } from "../features/bookings/types";

export function EditBookingPage() {
    const { bookingId } = useParams();
    const nav = useNavigate();

    const booking = useMemo(() => (bookingId ? getBookingById(bookingId) : null), [bookingId]);

    const trip = useMemo(() => {
        if (!booking) return null;
        const allTrips = [...getUserTrips(), ...tripsMock];
        return allTrips.find((t) => t.id === booking.tripId) ?? null;
    }, [booking]);

    const form = useForm<BookingForm>({
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: booking
            ? { contactName: booking.contactName, contactEmail: booking.contactEmail, seats: booking.seats }
            : undefined,
        mode: "onBlur",
    });

    if (!booking) {
        return (
            <div className="container stack">
                <h1>Edit booking</h1>
                <p className="muted">Rezervace neexistuje.</p>
                <Link to="/dashboard">← Zpět na Dashboard</Link>
            </div>
        );
    }

    const onSubmit = (values: BookingForm) => {
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

        updateBooking(updated);
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
                        <Link to="/dashboard">Zrušit</Link>
                    </div>
                </form>
            </section>
        </div>
    );
}
