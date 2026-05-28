import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getTripById, deleteUserTrip } from "../features/trips/repo";
import { addBooking, getBookings } from "../features/bookings/repo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingForm } from "../features/bookings/schemas";
import { FormError } from "../components/forms/FormError";
import { getCurrentUser } from "../features/auth/repo";
import type { Trip } from "../features/trips/types";
import type { Booking } from "../features/bookings/types";
import type { SubmitHandler } from "react-hook-form";
import { useTripTypes } from "../features/trips/useTripTypes";
import { formatDateRange } from "../features/trips/utils";
import { NotFoundPage } from "./NotFoundPage";

export function TripDetailPage() {
    const { tripId } = useParams();
    const nav = useNavigate();
    const user = getCurrentUser();

    const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
    const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
    const [done, setDone] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const tripTypes = useTripTypes();
    const typeLabel = tripTypes.find((t) => t.code === trip?.type)?.label ?? trip?.type ?? "";

    useEffect(() => {
        if (!tripId) { setTrip(null); return; }
        getTripById(tripId).then(setTrip).catch(() => setTrip(null));
        // Načti existující rezervaci přihlášeného uživatele pro tuto plavbu
        if (user) {
            getBookings()
                .then((bs) => setExistingBooking(bs.find((b) => b.tripId === tripId) ?? null))
                .catch(() => setExistingBooking(null));
        }
    }, [tripId]);

    const isOwnOffer = Boolean(user && trip?.ownerUserId && trip.ownerUserId === user.id);

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<BookingForm>({
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: { seats: 1 },
        mode: "onBlur",
    });

    // Jakmile se načte existující rezervace, předvyplň formulář
    useEffect(() => {
        if (existingBooking) reset({ seats: existingBooking.seats });
    }, [existingBooking]);

    if (trip === undefined) {
        return <div className="container stack"><p className="muted">Načítám...</p></div>;
    }
    if (!trip) return <NotFoundPage />;

    const imgSrc = trip.imageUrl ?? "/images/trips/placeholder_800.webp";
    const free = Math.max(0, trip.capacity - (trip.booked ?? 0));
    const badgeClass = `tripBadge tripBadge--${(trip.type ?? "relax").toLowerCase()}`;

    async function handleDelete(id: string) {
        if (!isOwnOffer) return;
        if (!confirm("Opravdu zrušit tuto plavbu?")) return;
        await deleteUserTrip(id);
        nav("/");
    }

    const onBook: SubmitHandler<BookingForm> = async (values) => {
        setApiError(null);
        // Při upsert: volná místa = aktuálně free + seats které už uživatel drží
        const heldSeats = existingBooking?.seats ?? 0;
        if (values.seats > free + heldSeats) {
            setError("seats", { type: "manual", message: "Počet míst je mimo kapacitu plavby." });
            return;
        }
        try {
            const saved = await addBooking({
                tripId: trip.id,
                createdAt: existingBooking?.createdAt ?? new Date().toISOString(),
                seats: values.seats,
                contactName: user?.name ?? "",
                contactEmail: user?.email ?? "",
                userId: user?.id,
            });
            // Znovu načti plavbu ze serveru – backend aktualizoval trip.booked
            const updated = await getTripById(trip.id);
            setTrip(updated);
            setExistingBooking(saved);
            setDone(true);
        } catch (err: any) {
            let msg: string | null = null;
            try { msg = JSON.parse(err?.message)?.message ?? null; } catch { /* není JSON */ }
            setApiError(msg ?? err?.message ?? "Rezervaci se nepodařilo uložit. Zkuste to znovu.");
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
                                Zrušit plavbu
                            </button>
                        </div>
                    )}
                </section>
            )}

            {/* ── Rezervační formulář ── */}
            <section className="card stack">
                <h2>Rezervace</h2>
                {isOwnOffer ? (
                    <p className="muted">Tohle je tvoje vlastní plavba – nemůžeš si ji rezervovat.</p>
                ) : done ? (
                    <div className="stack">
                        <p>✓ {existingBooking ? `Rezervace upravena – celkem ${existingBooking.seats} ${existingBooking.seats === 1 ? "místo" : "místa"}.` : "Rezervace uložena."}</p>
                        <Link to="/dashboard" className="btn">Jít na Můj přehled</Link>
                    </div>
                ) : !user ? (
                    <div className="bookingPromo">
                        <div className="bookingPromoIcon">⚓</div>
                        <div className="bookingPromoText">
                            <p className="bookingPromoTitle">Připoj se k posádce!</p>
                            <p className="muted bookingPromoSub">
                                Zaregistruj se zdarma a rezervuj místa na plavbách po celém světě.
                                Stačí pár kliknutí.
                            </p>
                        </div>
                        <div className="bookingPromoActions">
                            <Link to={`/register`} className="btn btnLg">Registrovat se zdarma</Link>
                            <Link to={`/login`} className="btn btnLg btnOutline">Přihlásit se</Link>
                        </div>
                    </div>
                ) : (
                    <form className="stack" onSubmit={handleSubmit(onBook)}>
                        {existingBooking && (
                            <div className="bookingStatus">
                                <div className="bookingStatusIcon">⚓</div>
                                <div className="bookingStatusBody">
                                    <p className="bookingStatusLabel">Tvoje rezervace</p>
                                    <p className="bookingStatusSeats">
                                        <span className="bookingStatusNum">{existingBooking.seats}</span>
                                        <span className="bookingStatusUnit">
                                            {existingBooking.seats === 1 ? "místo" : "místa"}
                                        </span>
                                    </p>
                                    <p className="bookingStatusHint">Změň počet níže a potvrď pro úpravu</p>
                                </div>
                                <Link
                                    to={`/bookings/${existingBooking.id}`}
                                    className="btn btnOutline"
                                    style={{ marginLeft: "auto", flexShrink: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Detail rezervace
                                </Link>
                            </div>
                        )}
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
                            <input
                                type="number"
                                min={1}
                                max={free + (existingBooking?.seats ?? 0)}
                                {...register("seats")}
                            />
                            <FormError error={errors.seats} />
                        </label>
                        {apiError && <p className="formError">{apiError}</p>}
                        <button className="btn" type="submit" disabled={isSubmitting || free === 0}>
                            {isSubmitting ? "Ukládám…" : free === 0 && !existingBooking ? "Obsazeno" : existingBooking ? "Upravit rezervaci" : "Rezervovat"}
                        </button>
                    </form>
                )}
            </section>

            <Link to="/" className="detailBack">← Zpět na přehled plaveb</Link>
        </div>
    );
}
