import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tripsMock } from "../data/tripsMock";
import { addBooking } from "../features/bookings/repo";
import { deleteUserTrip, getUserTrips } from "../features/trips/repo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingForm } from "../features/bookings/schemas";
import { FormError } from "../components/forms/FormError";
import type { Booking } from "../features/bookings/types";

function uid(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function TripDetailPage() {
    const { tripId } = useParams();
    const nav = useNavigate();

    const memo = useMemo(() => {
        const userTrips = getUserTrips();
        const user = userTrips.find((t) => t.id === tripId);
        if (user) return { trip: user, isUserTrip: true };

        const mock = tripsMock.find((t) => t.id === tripId);
        if (mock) return { trip: mock, isUserTrip: false };

        return { trip: null, isUserTrip: false };
    }, [tripId]);

    const trip = memo.trip;
    const isUserTrip = memo.isUserTrip;

    const [done, setDone] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<BookingForm>({
        resolver: zodResolver(bookingSchema),
        defaultValues: { seats: 1, contactName: "", contactEmail: "" },
        mode: "onBlur",
    });


    if (!trip) {
        return (
            <div className="container stack">
                <h1>Trip not found</h1>
                <p className="muted">Plavba „{tripId}“ neexistuje.</p>
                <Link to="/">← Zpět na Discover</Link>
            </div>
        );
    }

    function handleDelete() {
        if (!isUserTrip) return;
        const ok = confirm("Opravdu smazat tuto nabídku?");
        if (!ok) return;

        deleteUserTrip(trip.id);
        nav("/");
    }

    const onBook = (values: BookingForm) => {
        if (values.seats > trip.capacity) {
            setError("seats", { type: "manual", message: "Počet míst je mimo kapacitu plavby." });
            return;
        }

        const booking: Booking = {
            id: uid(),
            tripId: trip.id,
            createdAt: new Date().toISOString(),
            seats: values.seats,
            contactName: values.contactName.trim(),
            contactEmail: values.contactEmail.trim(),
        };

        addBooking(booking);
        setDone(true);
    };

    return (
        <div className="container stack">
            <header className="stack">
                <h1>{trip.title}</h1>
                <p className="muted">
                    {trip.location}
                    {trip.country ? ` · ${trip.country}` : ""} · {trip.startDate} – {trip.endDate} · {trip.type}
                </p>
            </header>

            <section className="card stack">
                <p>
                    <strong>{trip.priceCzk.toLocaleString()} Kč</strong> / osoba · kapacita{" "}
                    <strong>{trip.capacity}</strong>
                </p>
                <p className="muted">{trip.description}</p>

                {trip.highlights?.length ? (
                    <ul className="tripHighlights">
                        {trip.highlights.slice(0, 6).map((h) => (
                            <li key={h}>{h}</li>
                        ))}
                    </ul>
                ) : null}

                {isUserTrip && (
                    <button className="btn" type="button" onClick={handleDelete}>
                        Delete offer
                    </button>
                )}
            </section>

            <section className="card stack">
                <h2>Rezervace</h2>

                {done ? (
                    <div className="stack">
                        <p>✅ Rezervace uložena do LocalStorage.</p>
                        <Link to="/dashboard">Jít na Dashboard</Link>
                    </div>
                ) : (
                    <form className="stack" onSubmit={handleSubmit(onBook)}>
                        <label className="field">
                            <span>Jméno</span>
                            <input {...register("contactName")} placeholder="Např. Efka" />
                            <FormError error={errors.contactName} />
                        </label>

                        <label className="field">
                            <span>Email</span>
                            <input {...register("contactEmail")} placeholder="efka@email.cz" />
                            <FormError error={errors.contactEmail} />
                        </label>

                        <label className="field">
                            <span>Počet míst</span>
                            <input type="number" min={1} max={trip.capacity} {...register("seats")} />
                            <FormError error={errors.seats} />
                        </label>

                        <button className="btn" type="submit" disabled={isSubmitting}>
                            Rezervovat
                        </button>
                    </form>
                )}
            </section>

            <Link to="/">← Zpět na Discover</Link>
        </div>
    );
}