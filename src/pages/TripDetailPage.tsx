import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tripsMock } from "../data/tripsMock";
import { addBooking } from "../features/bookings/repo";
import { deleteUserTrip, getUserTrips } from "../features/trips/repo";
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

    const [seats, setSeats] = useState(1);
    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [done, setDone] = useState(false);

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

    function handleBook() {
        if (!contactName.trim()) return alert("Vyplň jméno.");
        if (!contactEmail.includes("@")) return alert("Zadej validní email.");
        if (seats < 1 || seats > trip.capacity) return alert("Počet míst je mimo rozsah.");

        const booking: Booking = {
            id: uid(),
            tripId: trip.id,
            createdAt: new Date().toISOString(),
            seats,
            contactName: contactName.trim(),
            contactEmail: contactEmail.trim(),
        };

        addBooking(booking);
        setDone(true);
    }

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
                    <>
                        <label className="field">
                            <span>Jméno</span>
                            <input
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                placeholder="Např. Efka"
                            />
                        </label>

                        <label className="field">
                            <span>Email</span>
                            <input
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="efka@email.cz"
                            />
                        </label>

                        <label className="field">
                            <span>Počet míst</span>
                            <input
                                type="number"
                                min={1}
                                max={trip.capacity}
                                value={seats}
                                onChange={(e) => setSeats(Number(e.target.value))}
                            />
                        </label>

                        <button className="btn" type="button" onClick={handleBook}>
                            Rezervovat
                        </button>
                    </>
                )}
            </section>

            <Link to="/">← Zpět na Discover</Link>
        </div>
    );
}