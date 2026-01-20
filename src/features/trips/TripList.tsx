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
            {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
            ))}
        </div>
    );
}