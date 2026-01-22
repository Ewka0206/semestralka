import type { Trip } from "./types.ts";
import { TripCard } from "./TripCard.tsx";

type Props = {
    trips: Trip[];
};

export function TripList({ trips }: Props) {
    if (trips.length === 0) {
        return <p className="muted">Nenalezeny žádné plavby.</p>;
    }

    return (
        <div className="stack">
            <h1>Nabídka plaveb</h1>
            <div className="tripGrid">
                {trips.map((trip,i) => (
                    <TripCard key={trip.id} trip={trip} priority={i === 0}/>
                ))}
            </div>
        </div>
    );
}