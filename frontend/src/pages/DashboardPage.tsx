import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Booking } from "../features/bookings/types";
import type { Trip } from "../features/trips/types";
import { getBookings, deleteBooking } from "../features/bookings/repo";
import { getAllTrips, getUserTrips, deleteUserTrip } from "../features/trips/repo";
import { getCurrentUser } from "../features/auth/repo";
import { formatDateRange } from "../features/trips/utils";

export function DashboardPage() {
    const user = getCurrentUser();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [myOffers, setMyOffers] = useState<Trip[]>([]);
    const [allTrips, setAllTrips] = useState<Trip[]>([]);

    useEffect(() => {
        getAllTrips().then(setAllTrips).catch(console.error);
        getBookings().then(setBookings).catch(console.error);
        if (user) {
            getUserTrips(user.id).then(setMyOffers).catch(console.error);
        }
    }, []);

    async function handleDeleteOffer(tripId: string) {
        if (!confirm("Opravdu smazat tuto nabídku?")) return;
        await deleteUserTrip(tripId);
        setMyOffers((prev) => prev.filter((t) => t.id !== tripId));
    }

    async function handleCancelBooking(bookingId: string) {
        if (!confirm("Opravdu chceš zrušit rezervaci?")) return;
        await deleteBooking(bookingId);
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    }

    const roleLabel = user?.role === "captain" ? "Kapitán" : "Člen posádky";

    return (
        <div className="container stack">

            {/* ── Uvítací banner ── */}
            <div className="dashWelcome card">
                <div className="dashWelcomeInner">
                    <div>
                        <p className="sectionTitle">Můj přehled</p>
                        <h1 className="dashName">Ahoj, {user?.name ?? "námořníku"}!</h1>
                        <p className="muted dashRole">⚓ {roleLabel} · {user?.email}</p>
                    </div>
                    <div className="dashStats">
                        <div className="dashStat">
                            <span className="dashStatNum">{myOffers.length}</span>
                            <span className="dashStatLabel">Moje plavby</span>
                        </div>
                        <div className="dashStat">
                            <span className="dashStatNum">{bookings.length}</span>
                            <span className="dashStatLabel">Rezervace</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Moje rezervace ── */}
            <section className="card stack">
                <div className="dashSectionHead">
                    <h2 className="dashSectionTitle">🗓 Moje rezervace</h2>
                </div>

                {bookings.length === 0 ? (
                    <div className="dashEmpty">
                        <span className="dashEmptyIcon">🌊</span>
                        <p>Zatím žádné rezervace.</p>
                        <Link to="/" className="btn">Procházet plavby</Link>
                    </div>
                ) : (
                    <ul className="list">
                        {bookings.map((b) => {
                            const trip = allTrips.find((t) => t.id === b.tripId);
                            return (
                                <li key={b.id} className="listItem">
                                    <img
                                        src={trip?.imageUrl ?? "/images/trips/placeholder_800.webp"}
                                        alt={trip?.title ?? "Plavba"}
                                        className="bookingThumb"
                                    />
                                    <div className="listMain">
                                        <strong>{trip?.title ?? b.tripId}</strong>
                                        <span className="muted">
                                            {b.seats} {b.seats === 1 ? "místo" : "místa"}
                                            {trip ? ` · ${trip.startDate} – ${trip.endDate}` : ""}
                                        </span>
                                    </div>
                                    <div className="actionsRow">
                                        <Link className="btn" to={`/trips/${b.tripId}`}>Detail</Link>
                                        <Link className="btn" to={`/bookings/${b.id}/edit`}>Upravit</Link>
                                        <button className="btn btnDanger" type="button" onClick={() => handleCancelBooking(b.id)}>
                                            Zrušit
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {/* ── Moje plavby ── */}
            <section className="card stack">
                <div className="dashSectionHead">
                    <h2 className="dashSectionTitle">⛵ Moje plavby</h2>
                    <Link className="btn" to="/offers/new">+ Nová plavba</Link>
                </div>

                {myOffers.length === 0 ? (
                    <div className="dashEmpty">
                        <span className="dashEmptyIcon">🧭</span>
                        <p>Zatím žádná nabídka plavby.</p>
                        <Link to="/offers/new" className="btn">Vytvořit první plavbu</Link>
                    </div>
                ) : (
                    <ul className="list">
                        {myOffers.map((t) => (
                            <li key={t.id} className="listItem">
                                <div className="listMain">
                                    <strong>{t.title}</strong>
                                    <span className="muted">
                                        {t.location}{t.country ? ` · ${t.country}` : ""} · {formatDateRange(t.startDate, t.endDate)}
                                    </span>
                                    <span className="muted">{t.priceCzk.toLocaleString("cs-CZ")} Kč / os.</span>
                                </div>
                                <div className="actionsRow">
                                    <Link className="btn" to={`/trips/${t.id}`}>Detail</Link>
                                    <Link className="btn" to={`/offers/${t.id}/edit`}>Upravit</Link>
                                    <button className="btn btnDanger" type="button" onClick={() => handleDeleteOffer(t.id)}>
                                        Smazat
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
