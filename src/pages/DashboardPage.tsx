import { Link } from "react-router-dom";
import { tripsMock } from "../data/tripsMock";
import { deleteUserTrip, getUserTrips } from "../features/trips/repo";
import { getCurrentUser } from "../features/auth/repo";
import { deleteBooking, getBookings } from "../features/bookings/repo";

export function DashboardPage() {
    const bookings = getBookings();
    const user = getCurrentUser();
    const myOffers = getUserTrips().filter((t) => t.ownerUserId === user?.id);

    function handleDeleteOffer(tripId: string) {
        const ok = confirm("Opravdu smazat tuto nabídku?");
        if (!ok) return;
        deleteUserTrip(tripId);
        // jednoduché řešení bez contextu: reload stránky, aby se seznam aktualizoval
        window.location.reload();
    }
    function handleCancelBooking(bookingId: string) {
        const ok = confirm("Opravdu chceš zrušit rezervaci?");
        if (!ok) return;
        deleteBooking(bookingId);
        window.location.reload();
    }

    return (
        <div className="container stack">
            <h1>Můj přehled</h1>

            {/* ========================= */}
            {/* MOJE REZERVACE */}
            {/* ========================= */}
            <section className="card stack">
                <h2>Moje rezervace</h2>

                {bookings.length === 0 ? (
                    <p className="muted">
                        Zatím nemáš žádné rezervace. Vyber si něco na <Link to="/">Přehled nabídek</Link>.
                    </p>
                ) : (
                    <ul className="list">
                        {bookings.map((b) => {
                            // booking může být i na user trip → hledáme v obou zdrojích
                            const allTrips = [...getUserTrips(), ...tripsMock];
                            const trip = allTrips.find((t) => t.id === b.tripId);

                            return (
                                <li key={b.id} className="listItem">
                                    <div className ="listMain">
                                        <div>
                                            <strong>{trip?.title ?? b.tripId}</strong>
                                        </div>
                                        <div className="muted">
                                            {b.seats} míst · {new Date(b.createdAt).toLocaleString()}
                                        </div>
                                        <div className="muted">
                                            {b.contactName} · {b.contactEmail}
                                        </div>
                                    </div>

                                    <div className="actionsRow">
                                        <Link className="btn" to={`/trips/${b.tripId}`}>Detail plavby</Link>
                                        <Link className="btn" to={`/bookings/${b.id}`}>Detail rezervace</Link>
                                        <Link className="btn" to={`/bookings/${b.id}/edit`}>Upravit</Link>
                                        <button className="btn" type="button" onClick={() => handleCancelBooking(b.id)}>
                                            Zrušit
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {/* ========================= */}
            {/* MOJE NABÍDKY */}
            {/* ========================= */}
            <section className="card stack">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <h2>Moje plavby</h2>
                    <Link className="btn" to="/offers/new">
                        + Nová plavba
                    </Link>
                </div>

                {myOffers.length === 0 ? (
                    <p className="muted">
                        Zatím nemáš žádnou plavbu. Vytvoř si ji přes <Link to="/offers/new">Nová plavba</Link>.
                    </p>
                ) : (
                    <ul className="list">
                        {myOffers.map((t) => (
                            <li key={t.id} className="listItem">
                                <div className = "listMain" >
                                    <div>
                                        <strong>{t.title}</strong>
                                    </div>
                                    <div className="muted">
                                        {t.location}
                                        {t.country ? ` · ${t.country}` : ""} · {t.startDate} – {t.endDate} ·{" "}
                                        {t.priceCzk.toLocaleString("cs-CZ")} Kč
                                    </div>
                                </div>

                                <div className="actionsRow">
                                    <Link className="btn" to={`/trips/${t.id}`}>Detail plavby</Link>
                                    <Link className="btn" to={`/offers/${t.id}/edit`}>Upravit</Link>
                                    <button className="btn" type="button" onClick={() => handleDeleteOffer(t.id)}>
                                        Zrušit
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