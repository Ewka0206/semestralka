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
import { formatDateRange } from "../features/trips/utils";
import { NotFoundPage } from "./NotFoundPage";

export function TripDetailPage() {
    const { tripId } = useParams();
    const nav = useNavigate();
    const user = getCurrentUser();

    const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
    const [done, setDone] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
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
        defaultValues: { seats: 1 },
        mode: "onBlur",
    });

    if (trip === undefined) {
        return <div className="container stack"><p className="muted">Načítám...</p></div>;
    }
    if (!trip) return <NotFoundPage />;

    const imgSrc = trip.imageUrl ?? "/images/trips/placeholder_800.webp";
    const free = Math.max(0, trip.capacity - (trip.booked ?? 0));
    const badgeClass = `tripBadge tripBadge--${(trip.type ?? "relax").toLowerCase()}`;

    async function handleDelete(id: string) {
        if (!isOwnOffer) return;
        if (!confirm("Opravdu smazat tuto nabídku?")) return;
        await deleteUserTrip(id);
        nav("/");
    }

    const onBook: SubmitHandler<BookingForm> = async (values) => {
        setApiError(null);
        if (values.seats > free) {
            setError("seats", { type: "manual", message: "Počet míst je mimo kapacitu plavby." });
            return;
        }
        try {
            await addBooking({
                tripId: trip.id,
                createdAt: new Date().toISOString(),
                seats: values.seats,
                contactName: user?.name ?? "",
                contactEmail: user?.email ?? "",
                userId: user?.id,
            });
            setDone(true);
        } catch {
            setApiError("Rezervaci se nepodařilo uložit. Zkuste to znovu.");
        }
    };

    return (
        <div className="container stack">

            {/* ── Hero fotka s badge ── */}
            <div className="tripHeroWrap">
                <img src={imgSrc} alt={trip.title} className="tripHero" fetchPriority="high" decoding="async" />
                <span className={badgeClass}>{typeLabel}</span>
            </div>

            {/* ── Titulek + meta ── */}
            <div className="card detailHeader">
                <div className="detailTitleBlock">
                    <h1 className="detailTitle">{trip.title}</h1>
                    <p className="tripLocation">
                        {trip.location}{trip.country ? ` · ${trip.country}` : ""}
                    </p>
                </div>
                <div className="detailMeta">
                    <div className="tripMetaRow">
                        <span>Termín</span>
                        <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </div>
                    <div className="tripMetaRow">
                        <span>Volná místa</span>
                        <span>{free} / {trip.capacity}</span>
                    </div>
                    <div className="tripMetaRow">
                        <span>Kapitán v ceně</span>
                        <span>{trip.skipperIncluded ? "✓ Ano" : "Ne"}</span>
                    </div>
                    <div className="tripMetaRow">
                        <span>Cena</span>
                        <span className="detailPrice">{trip.priceCzk.toLocaleString("cs-CZ")} Kč&nbsp;/ os.</span>
                    </div>
                </div>
            </div>

            {/* ── Popis + highlights ── */}
            {(trip.description || (trip.highlights?.length ?? 0) > 0) && (
                <section className="card stack">
                    <h2>O plavbě</h2>
                    {trip.description && <p className="muted">{trip.description}</p>}
                    {(trip.highlights?.length ?? 0) > 0 && (
                        <ul className="tripHighlights">
                            {trip.highlights!.slice(0, 6).map((h) => <li key={h}>{h}</li>)}
                        </ul>
                    )}
                    {isOwnOffer && (
                        <div className="actionsRow">
                            <Link className="btn" to={`/offers/${trip.id}/edit`}>Upravit plavbu</Link>
                            <button className="btn" type="button" onClick={() => handleDelete(trip.id)}>
                                Smazat plavbu
                            </button>
                        </div>
                    )}
                </section>
            )}

            {/* ── Rezervační formulář ── */}
            <section className="card stack">
                <h2>Rezervace</h2>
                {isOwnOffer ? (
                    <p className="muted">Tohle je tvoje vlastní nabídka – nemůžeš si ji rezervovat.</p>
                ) : done ? (
                    <div className="stack">
                        <p>✓ Rezervace uložena.</p>
                        <Link to="/dashboard" className="btn">Jít na Můj přehled</Link>
                    </div>
                ) : !user ? (
                    <div className="stack">
                        <p className="muted">Pro rezervaci musíš být přihlášen.</p>
                        <Link to="/login" className="btn">Přihlásit se</Link>
                    </div>
                ) : (
                    <form className="stack" onSubmit={handleSubmit(onBook)}>
                        <div className="profileRows">
                            <div className="profileRow">
                                <span className="muted">Jméno</span>
                                <span>{user.name}</span>
                            </div>
                            <div className="profileRow">
                                <span className="muted">Email</span>
                                <span>{user.email}</span>
                            </div>
                        </div>
                        <label className="field">
                            <span>Počet míst</span>
                            <input type="number" min={1} max={free} {...register("seats")} />
                            <FormError error={errors.seats} />
                        </label>
                        {apiError && <p className="formError">{apiError}</p>}
                        <button className="btn" type="submit" disabled={isSubmitting || free === 0}>
                            {isSubmitting ? "Ukládám…" : free === 0 ? "Obsazeno" : "Rezervovat"}
                        </button>
                    </form>
                )}
            </section>

            <Link to="/" className="detailBack">← Zpět na přehled plaveb</Link>
        </div>
    );
}
