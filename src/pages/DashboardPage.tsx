import { Link } from "react-router-dom";
import { getBookings } from "../features/bookings/repo";
import { tripsMock } from "../data/tripsMock";

export function DashboardPage() {
    const bookings = getBookings();

    return (
        <div className="container stack">
            <h1>Dashboard</h1>

            <section className="card stack">
                <h2>Moje rezervace</h2>

                {bookings.length === 0 ? (
                    <p className="muted">
                        Zatím nemáš žádné rezervace. Vyber si něco na <Link to="/">Discover</Link>.
                    </p>
                ) : (
                    <ul className="list">
                        {bookings.map((b) => {
                            const trip = tripsMock.find((t) => t.id === b.tripId);

                            return (
                                <li key={b.id} className="listItem">
                                    <div>
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

                                    <Link to={`/trips/${b.tripId}`}>Detail</Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <section className="card stack">
                <h2>Rychlé akce</h2>
                <Link to="/offers/new">Vytvořit nabídku</Link>
            </section>
        </div>
    );
}