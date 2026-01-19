import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { tripsMock } from "../data/tripsMock";
import { addBooking } from "../features/bookings/repo";
import { getUserTrips } from "../features/trips/repo";
import type { Booking } from "../features/bookings/types";

function uid(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function TripDetailPage() {
    const { tripId } = useParams();

    const trip = useMemo(() => {
        const all = [...getUserTrips(), ...tripsMock];
        return all.find((t) => t.id === tripId);
    }, [tripId]);

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
                    {trip.location} · {trip.startDate} – {trip.endDate} · {trip.type}
                </p>
            </header>

            <section className="card stack">
                <p>
                    <strong>{trip.priceCzk.toLocaleString()} Kč</strong> / osoba · kapacita{" "}
                    <strong>{trip.capacity}</strong>
                </p>
                <p className="muted">{trip.description}</p>
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
