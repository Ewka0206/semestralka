import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getBookingById, deleteBooking } from "../features/bookings/repo";
import { getTripById } from "../features/trips/repo";
import type { Booking } from "../features/bookings/types";
import type { Trip } from "../features/trips/types";

export function BookingDetailPage() {
    const { bookingId } = useParams();
    const nav = useNavigate();

    const [booking, setBooking] = useState<Booking | null | undefined>(undefined);
    const [trip, setTrip] = useState<Trip | null>(null);

    useEffect(() => {
        if (!bookingId) { setBooking(null); return; }
        getBookingById(bookingId).then((b) => {
            setBooking(b);
            if (b) getTripById(b.tripId).then(setTrip);
        });
    }, [bookingId]);

    if (booking === undefined) {
        return <div className="container stack"><p className="muted">Načítám...</p></div>;
    }

    if (!booking) {
        return (
            <div className="container stack">
                <h1>Booking not found</h1>
                <p className="muted">Rezervace neexistuje.</p>
                <Link to="/dashboard">← Zpět na Dashboard</Link>
            </div>
        );
    }

    async function handleCancel() {
        if (!confirm("Opravdu chceš zrušit rezervaci?")) return;
        await deleteBooking(booking!.id);
        nav("/dashboard");
    }

    return (
        <div className="container stack">
            <h1>Booking detail</h1>

            <section className="card stack">
                <div>
                    Plavba:{" "}
                    <strong>
                        {trip ? <Link to={`/trips/${trip.id}`}>{trip.title}</Link> : booking.tripId}
                    </strong>
                </div>

                <div className="muted">
                    Datum rezervace: {new Date(booking.createdAt).toLocaleString()}
                </div>

                <div>
                    Počet míst: <strong>{booking.seats}</strong>
                </div>

                <div className="muted">
                    Jméno: {booking.contactName} - email: {booking.contactEmail}
                </div>

                <div className="actionsRow">
                    <Link className="btn" to={`/bookings/${booking.id}/edit`}>
                        Upravit rezervaci
                    </Link>

                    <button className="btn" type="button" onClick={handleCancel}>
                        Zrušit rezervaci
                    </button>
                </div>
            </section>

            <Link to="/dashboard">← Zpět na Můj přehled</Link>
        </div>
    );
}
