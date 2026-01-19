import { Link } from "react-router-dom";
import type { Trip } from "./types.ts";
import { formatDateRange } from "./utils.ts";

type Props = { trip: Trip };

export function TripCard({ trip }: Props) {
    const booked = trip.booked ?? 0;
    const free = Math.max(0, trip.capacity - booked);

    const highlights = trip.highlights ?? [];

    return (
        <article className="tripCard">
            <div className="tripTop">
                <div>
                    <h3 className="tripTitle">{trip.title}</h3>
                    <p className="muted">
                        {trip.location}
                        {trip.country ? ` · ${trip.country}` : ""}
                        {" · "}
                        {trip.type}
                    </p>
                </div>

                <div className="pill">
                    cena <b>{trip.priceCzk.toLocaleString("cs-CZ")} Kč</b>
                </div>
            </div>

            <div className="tripMeta">
                <div>
                    <span className="muted">Termín</span>
                    <div>{formatDateRange(trip.startDate, trip.endDate)}</div>
                </div>
                <div>
                    <span className="muted">Volná místa</span>
                    <div>
                        {free} free / {trip.capacity}
                    </div>
                </div>
                <div>
                    <span className="muted">Kapitán v ceně</span>
                    <div>{trip.skipperIncluded ? "Ano" : "Ne"}</div>
                </div>
            </div>

            {highlights.length > 0 && (
                <ul className="tripHighlights">
                    {highlights.slice(0, 3).map((h) => (
                        <li key={h}>{h}</li>
                    ))}
                </ul>
            )}

            <div className="tripActions">
                <Link className="btn" to={`/trips/${trip.id}`}>
                    Detail
                </Link>
            </div>
        </article>
    );
}
