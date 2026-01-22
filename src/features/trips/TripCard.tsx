import { Link } from "react-router-dom";
import type { Trip } from "./types";
import { formatDateRange } from "./utils";
import { tripTypeLabels } from "./i18n";

type Props = { trip: Trip; priority?: boolean };

export function TripCard({ trip }: Props) {
    const booked = trip.booked ?? 0;
    const free = Math.max(0, trip.capacity - booked);
    const highlights = trip.highlights ?? [];
    const base = trip.imageUrl ?? "/images/trips/placeholder";

    return (
        <article className="tripCard">
            <Link to={`/trips/${trip.id}`} className="tripImageLink">
                <img
                    src={`${base}_800.webp`}
                    srcSet={`
                            ${base}_400.webp 400w,
                            ${base}_800.webp 800w,
                            ${base}_1200.webp 1200w
  `}
                    sizes="(max-width: 720px) 92vw, (max-width: 1024px) 45vw, 340px"
                    alt={trip.title}
                    className="tripImage"
                    loading="lazy"
                />
            </Link>

            <div className="tripContent">
                <div className="tripTop">
                    <div>
                        <h2 className="tripTitle">{trip.title}</h2>
                        <p className="muted">
                            {trip.location}
                            {trip.country ? ` · ${trip.country}` : ""}
                            {" · "}
                            {tripTypeLabels[trip.type]}
                        </p>
                    </div>
                </div>

                <div className="tripMeta">
                    <div className="pill">
                        cena <b>{trip.priceCzk.toLocaleString("cs-CZ")} Kč</b>
                    </div>

                    <div>
                        <span className="muted">Termín</span>
                        <div>{formatDateRange(trip.startDate, trip.endDate)}</div>
                    </div>

                    <div>
                        <span className="muted">Volná místa</span>
                        <div>
                            {free} / {trip.capacity}
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
            </div>
        </article>
    );
}