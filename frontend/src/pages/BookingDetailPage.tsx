import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getBookingById, deleteBooking } from "../features/bookings/repo";
import { getTripById } from "../features/trips/repo";
import type { Booking } from "../features/bookings/types";
import type { Trip } from "../features/trips/types";
import { NotFoundPage } from "./NotFoundPage";
import { formatDateRange } from "../features/trips/utils";

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

    const free = trip ? Math.max(0, trip.capacity - (trip.booked ?? 0)) : null;

    return (
        <div className="container stack">

            {/* ── Náhled plavby ── */}
            {trip && (
                <div className="tripHeroWrap" style={{ maxHeight: 200, overflow: "hidden" }}>
                    <img
                        src={trip.imageUrl ?? "/images/trips/placeholder_800.webp"}
                        alt={trip.title}
                        className="tripHero"
                        style={{ objectPosition: "center 55%" }}
                    />
                </div>
            )}

            <section className="card stack">
                <div className="formPageHeader">
                    <p className="sectionTitle">Rezervace</p>
                    <h1 className="formPageTitle">
                        {trip
                            ? <Link to={`/trips/${trip.id}`} style={{ color: "inherit", textDecoration: "none" }}>{trip.title}</Link>
                            : "Detail rezervace"}
                    </h1>
                </div>

                {/* ── Stat karty ── */}
                <div className="statGrid">
                    <div className="statCard">
                        <span className="statCardIcon">🪑</span>
                        <span className="statCardNum">{booking.seats}</span>
                        <p className="statCardLabel">Rezerv. místa</p>
                    </div>
                    {trip && (
                        <div className="statCard">
                            <span className="statCardIcon">🗓️</span>
                            <span className="statCardNum" style={{ fontSize: "1rem", paddingTop: 4 }}>
                                {formatDateRange(trip.startDate, trip.endDate)}
                            </span>
                            <p className="statCardLabel">Termín plavby</p>
                        </div>
                    )}
                    {trip && (
                        <div className="statCard">
                            <span className="statCardIcon">⚓</span>
                            <span className="statCardNum">{free}</span>
                            <p className="statCardLabel">Volných míst</p>
                        </div>
                    )}
                    <div className="statCard">
                        <span className="statCardIcon">📅</span>
                        <span className="statCardNum" style={{ fontSize: "1rem", paddingTop: 4 }}>
                            {new Date(booking.createdAt).toLocaleDateString("cs-CZ")}
                        </span>
                        <p className="statCardLabel">Datum rezervace</p>
                    </div>
                </div>

                {/* ── Detailní řádky ── */}
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
