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
            {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
            ))}
        </div>
    );
}