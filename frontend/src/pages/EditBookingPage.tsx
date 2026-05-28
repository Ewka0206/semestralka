import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { bookingSchema, type BookingForm } from "../features/bookings/schemas";
import { getBookingById, updateBooking } from "../features/bookings/repo";
import { getTripById } from "../features/trips/repo";
import { getCurrentUser } from "../features/auth/repo";
import { FormError } from "../components/forms/FormError";
import type { Booking } from "../features/bookings/types";
import type { Trip } from "../features/trips/types";
import { NotFoundPage } from "./NotFoundPage";

export function EditBookingPage() {
    const { bookingId } = useParams();
    const nav = useNavigate();
    const user = getCurrentUser();

    const [booking, setBooking] = useState<Booking | null | undefined>(undefined);
    const [trip, setTrip] = useState<Trip | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm<BookingForm>({
        resolver: zodResolver(bookingSchema) as any,
        mode: "onBlur",
    });

    useEffect(() => {
        if (!bookingId) { setBooking(null); return; }
        getBookingById(bookingId).then((b) => {
            setBooking(b);
            if (b) {
                form.reset({ seats: b.seats });
                getTripById(b.tripId).then(setTrip);
            }
        });
    }, [bookingId]);

    if (booking === undefined) return <div className="container stack"><p className="muted">Načítám...</p></div>;
    if (!booking) return <NotFoundPage />;

    const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

    const onSubmit = async (values: BookingForm) => {
        setApiError(null);
        if (trip && values.seats > trip.capacity) {
            form.setError("seats", { type: "manual", message: "Počet míst je mimo kapacitu plavby." });
            return;
        }
        try {
            await updateBooking({
                ...booking,
                seats: values.seats,
                contactName: user?.name ?? booking.contactName,
                contactEmail: user?.email ?? booking.contactEmail,
                userId: user?.id ?? booking.userId,
            });
            nav(`/bookings/${booking.id}`);
        } catch {
            setApiError("Nepodařilo se uložit změny. Zkuste to znovu.");
        }
    };

    return (
        <div className="container stack">

            <div className="formHeroStrip">
                <div>
                    <p className="sectionTitle">Upravit rezervaci</p>
                    <h1>{trip?.title ?? "Rezervace"}</h1>
                </div>
            </div>

            <form className="card stack" onSubmit={handleSubmit(onSubmit)}>

                {/* Read-only info o uživateli */}
                <div className="profileRows">
                    <div className="profileRow">
                        <span className="muted">Jméno</span>
                        <span>{user?.name ?? booking.contactName}</span>
                    </div>
                    <div className="profileRow">
                        <span className="muted">Email</span>
                        <span>{user?.email ?? booking.contactEmail}</span>
                    </div>
                </div>

                <label className="field">
                    <span>Počet míst</span>
                    <input type="number" min={1} max={trip?.capacity ?? undefined} {...register("seats")} />
                    <FormError error={errors.seats} />
                </label>

                {apiError && <p className="formError">{apiError}</p>}

                <div className="actionsRow">
                    <button className="btn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Ukládám…" : "Uložit změny"}
                    </button>
                    <Link className="btn btnOutline" to="/dashboard">Zrušit</Link>
                </div>
            </form>

            <Link className="detailBack" to="/dashboard">← Zpět na Můj přehled</Link>
        </div>
    );
}
