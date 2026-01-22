import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tripsMock } from "../data/tripsMock";
import { addBooking } from "../features/bookings/repo";
import { deleteUserTrip, getUserTrips } from "../features/trips/repo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingForm } from "../features/bookings/schemas";
import { FormError } from "../components/forms/FormError";
import { getCurrentUser } from "../features/auth/repo";
import type { Booking } from "../features/bookings/types";
import type { Trip } from "../features/trips/types";
import type { SubmitHandler} from "react-hook-form";
import { tripTypeLabels } from "../features/trips/i18n";

function uid(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function TripDetailPage() {
    const { tripId } = useParams();
    const nav = useNavigate();

    const memo = useMemo<{ trip: Trip | null; isUserTrip: boolean }>(() => {
        const userTrips = getUserTrips();
        const userTrip = userTrips.find((t) => t.id === tripId);
        if (userTrip) return { trip: userTrip, isUserTrip: true };

        const mockTrip = tripsMock.find((t) => t.id === tripId);
        if (mockTrip) return { trip: mockTrip, isUserTrip: false };

        return { trip: null, isUserTrip: false };
    }, [tripId]);

    const trip = memo.trip;

    const user = getCurrentUser();
    const isOwnOffer = Boolean(user && trip?.ownerUserId && trip.ownerUserId === user.id);

    const [done, setDone] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<BookingForm>({
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: { seats: 1, contactName: "", contactEmail: "" },
        mode: "onBlur",
    });


    if (!trip) {
        return (
            <div className="container stack">
                <h1>Trip not found</h1>
                <p className="muted">Plavba „{tripId}“ neexistuje.</p>
                <Link to="/">← Zpět na Domovskou stránku</Link>
            </div>
        );
    }

    const base = trip.imageUrl ?? "/images/trips/placeholder";

    function handleDelete(tripIdToDelete: string) {
        if (!isOwnOffer) return;
        const ok = confirm("Opravdu smazat tuto nabídku?");
        if (!ok) return;

        deleteUserTrip(tripIdToDelete);
        nav("/");
    }

    const onBook: SubmitHandler<BookingForm> = (values) => {
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
                    {trip.country ? ` · ${trip.country}` : ""} · {trip.startDate} – {trip.endDate} · {tripTypeLabels[trip.type]}
                </p>
            </header>

            <div className="tripHeroWrap">
                <img src={`${base}_1200.webp`}
                     srcSet={`
                            ${base}_400.webp 400w,
                            ${base}_800.webp 800w,
                            ${base}_1200.webp 1200w
  `}
                     sizes="(max-width: 720px) 92vw, (max-width: 1024px) 45vw, 340px"
                     alt={trip.title}
                     className="tripHero"
                     fetchPriority="high"
                     decoding="async"/>
            </div>

            <section className="card stack">

                <p className="muted">{trip.description}</p>

                {trip.highlights?.length ? (
                    <ul className="tripHighlights">
                        {trip.highlights.slice(0, 6).map((h) => (
                            <li key={h}>{h}</li>
                        ))}
                    </ul>
                ) : null}

                <p>
                    Počet volných míst{" "} <strong>{trip.capacity}</strong>  ·   Cena <strong>{trip.priceCzk.toLocaleString()} Kč</strong> / osoba
                </p>

                {isOwnOffer && (
                    <div className="actionsRow">
                        <Link className="btn" to={`/offers/${trip.id}/edit`}>
                            Upravit plavbu
                        </Link>

                        <button className="btn" type="button" onClick={() => handleDelete(trip.id)}>
                            Smazat plavbu
                        </button>
                    </div>
                )}
            </section>

            <section className="card stack">
                <h2>Rezervace</h2>

                {isOwnOffer ? (
                    <p className="muted">
                        Tohle je tvoje vlastní nabídka – nemůžeš si ji rezervovat.
                    </p>
                ) : done ? (
                    <div className="stack">
                        <p>✅ Rezervace uložena do LocalStorage.</p>
                        <Link to="/dashboard">Jít na Můj přehled</Link>
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

            <Link to="/">← Zpět na Domovskou stránku</Link>
        </div>
    );
}