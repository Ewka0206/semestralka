import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getBookingById, deleteBooking } from "../features/bookings/repo";
import { getUserTrips } from "../features/trips/repo";
import { tripsMock } from "../data/tripsMock";

export function BookingDetailPage() {
    const { bookingId } = useParams();
    const nav = useNavigate();

    const booking = useMemo(() => (bookingId ? getBookingById(bookingId) : null), [bookingId]);

    const trip = useMemo(() => {
        if (!booking) return null;
        const allTrips = [...getUserTrips(), ...tripsMock];
        return allTrips.find((t) => t.id === booking.tripId) ?? null;
    }, [booking]);

    if (!booking) {
        return (
            <div className="container stack">
                <h1>Booking not found</h1>
                <p className="muted">Rezervace neexistuje.</p>
                <Link to="/dashboard">← Zpět na Dashboard</Link>
            </div>
        );
    }

    const bookingIdSafe = booking.id;

    function handleCancel() {
        const ok = confirm("Opravdu chceš zrušit rezervaci?");
        if (!ok) return;

        deleteBooking(bookingIdSafe);
        nav("/dashboard");
    }

    return (
        <div className="container stack">
            <h1>Booking detail</h1>

            <section className="card stack">
                <div>
                    Plavba:{ " "}
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