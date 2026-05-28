import { Link } from "react-router-dom";
import type { Trip } from "./types";
import { formatDateRange } from "./utils";
import { useTripTypes } from "./useTripTypes";

type Props = { trip: Trip; priority?: boolean };

export function TripCard({ trip }: Props) {
    const tripTypes = useTripTypes();
    const typeLabel = tripTypes.find((t) => t.code === trip.type)?.label ?? trip.type;
    const booked = trip.booked ?? 0;
    const free = Math.max(0, trip.capacity - booked);
    const highlights = trip.highlights ?? [];
    const imgSrc = trip.imageUrl ?? "/images/trips/placeholder_800.webp";
    const badgeClass = `tripBadge tripBadge--${(trip.type ?? "relax").toLowerCase()}`;

    return (
        <article className="tripCard">
            <Link to={`/trips/${trip.id}`} className="tripImageLink">
                <img
                    src={imgSrc}
                    alt={trip.title}
                    className="tripImage"
                    loading="lazy"
                />
                <span className={badgeClass}>{typeLabel}</span>
            </Link>

            <div className="tripContent">
                <div className="tripTop">
                    <h2 className="tripTitle">{trip.title}</h2>
                    <p className="tripLocation">
                        {trip.location}
                        {trip.country ? ` · ${trip.country}` : ""}
                    </p>
                </div>

                <div className="tripPrice">
                    {trip.priceCzk.toLocaleString("cs-CZ")} Kč
                </div>

                <div className="tripMeta">
                    <div className="tripMetaRow">
                        <span>Termín</span>
                        <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </div>
                    <div className="tripMetaRow">
                        <span>Volná místa</span>
                        <span>{free} / {trip.capacity}</span>
                    </div>
                    <div className="tripMetaRow">
                        <span>Kapitán v ceně</span>
                        <span>{trip.skipperIncluded ? "✓ Ano" : "Ne"}</span>
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
                        Detail plavby
                    </Link>
                </div>
            </div>
        </article>
    );
}
