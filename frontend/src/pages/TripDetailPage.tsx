import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getTripById, deleteUserTrip } from "../features/trips/repo";
import { addBooking } from "../features/bookings/repo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingForm } from "../features/bookings/schemas";
import { FormError } from "../components/forms/FormError";
import { getCurrentUser } from "../features/auth/repo";
import type { Trip } from "../features/trips/types";
import type { SubmitHandler } from "react-hook-form";
import { useTripTypes } from "../features/trips/useTripTypes";

export function TripDetailPage() {
    const { tripId } = useParams();
    const nav = useNavigate();
    const user = getCurrentUser();

    const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
    const [done, setDone] = useState(false);
    const tripTypes = useTripTypes();
    const typeLabel = tripTypes.find((t) => t.code === trip?.type)?.label ?? trip?.type ?? "";

    useEffect(() => {
        if (!tripId) { setTrip(null); return; }
        getTripById(tripId).then(setTrip).catch(() => setTrip(null));
    }, [tripId]);

    const isOwnOffer = Boolean(user && trip?.ownerUserId && trip.ownerUserId === user.id);

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

    if (trip === undefined) {
        return <div className="container stack"><p className="muted">Načítám...</p></div>;
    }

    if (!trip) {
        return (
            <div className="container stack">
                <h1>Trip not found</h1>
                <p className="muted">Plavba „{tripId}" neexistuje.</p>
                <Link to="/">← Zpět na Domovskou stránku</Link>
            </div>
        );
    }

    const rawUrl = trip.imageUrl ?? "/images/trips/placeholder";
    const hasExt = /\.\w{2,5}$/.test(rawUrl);
    const imgSrc = hasExt ? rawUrl : `${rawUrl}_1200.webp`;
    const imgSrcSet = hasExt ? undefined : `${rawUrl}_400.webp 400w, ${rawUrl}_800.webp 800w, ${rawUrl}_1200.webp 1200w`;

    async function handleDelete(tripIdToDelete: string) {
        if (!isOwnOffer) return;
        if (!confirm("Opravdu smazat tuto nabídku?")) return;
        await deleteUserTrip(tripIdToDelete);
        nav("/");
    }

    const onBook: SubmitHandler<BookingForm> = async (values) => {
        const freeSeats = Math.max(0, trip!.capacity - (trip!.booked ?? 0));
        if (values.seats > freeSeats) {
            setError("seats", { type: "manual", message: "Počet míst je mimo kapacitu plavby." });
            return;
        }

        await addBooking({
            tripId: trip!.id,
            createdAt: new Date().toISOString(),
            seats: values.seats,
            contactName: values.contactName.trim(),
            contactEmail: values.contactEmail.trim(),
        });
        setDone(true);
    };

    return (
        <div className="container stack">
            <header className="stack">
                <h1>{trip.title}</h1>
                <p className="muted">
                    {trip.location}
                    {trip.country ? ` · ${trip.country}` : ""} · {trip.startDate} – {trip.endDate} · {typeLabel}
                </p>
            </header>

            <div className="tripHeroWrap">
                <img src={imgSrc}
                     srcSet={imgSrcSet}
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
                    Počet volných míst{" "}<strong>{Math.max(0, trip.capacity - (trip.booked ?? 0))}</strong> z {trip.capacity} · Cena <strong>{trip.priceCzk.toLocaleString()} Kč</strong> / osoba
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
                    <p className="muted">Tohle je tvoje vlastní nabídka – nemůžeš si ji rezervovat.</p>
                ) : done ? (
                    <div className="stack">
                        <p>Rezervace uložena.</p>
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
                            <input type="number" min={1} max={Math.max(0, trip.capacity - (trip.booked ?? 0))} {...register("seats")} />
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
