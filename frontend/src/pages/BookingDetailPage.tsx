import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getBookingById, deleteBooking } from "../features/bookings/repo";
import { getTripById } from "../features/trips/repo";
import type { Booking } from "../features/bookings/types";
import type { Trip } from "../features/trips/types";
import { NotFoundPage } from "./NotFoundPage";

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

    if (booking === undefined) return <div className="container stack"><p className="muted">Načítám...</p></div>;
    if (!booking) return <NotFoundPage />;

    async function handleCancel() {
        if (!confirm("Opravdu chceš zrušit rezervaci?")) return;
        await deleteBooking(booking!.id);
        nav("/dashboard");
    }

    return (
        <div className="container stack">
            <section className="card stack">
                <div className="formPageHeader">
                    <p className="sectionTitle">Rezervace</p>
                    <h1 className="formPageTitle">{trip?.title ?? "Detail rezervace"}</h1>
                </div>

                <div className="profileRows">
                    <div className="profileRow">
                        <span className="muted">Plavba</span>
                        <strong>
                            {trip
                                ? <Link to={`/trips/${trip.id}`}>{trip.title}</Link>
                                : booking.tripId}
                        </strong>
                    </div>
                    <div className="profileRow">
                        <span className="muted">Datum rezervace</span>
                        <span>{new Date(booking.createdAt).toLocaleDateString("cs-CZ")}</span>
                    </div>
                    <div className="profileRow">
                        <span className="muted">Počet míst</span>
                        <strong>{booking.seats}</strong>
                    </div>
                    <div className="profileRow">
                        <span className="muted">Jméno</span>
                        <span>{booking.contactName}</span>
                    </div>
                    <div className="profileRow">
                        <span className="muted">Email</span>
                        <span>{booking.contactEmail}</span>
                    </div>
                </div>

                <div className="actionsRow">
                    <Link className="btn" to={`/bookings/${booking.id}/edit`}>Upravit rezervaci</Link>
                    <button className="btn btnDanger" type="button" onClick={handleCancel}>Zrušit rezervaci</button>
                </div>
            </section>

            <Link className="detailBack" to="/dashboard">← Zpět na Můj přehled</Link>
        </div>
    );
}
