import { useMemo, useState } from "react";
import { tripsMock } from "../data/tripsMock";

import { TripFilters } from "../features/trips/TripFilters";
import { TripList } from "../features/trips/TripList";
import { applyTripFilters, defaultTripFilters } from "../features/trips/utils";
import { getUserTrips } from "../features/trips/repo";

export function HomePage() {
    const [filters, setFilters] = useState(defaultTripFilters());

    const allTrips = useMemo(() => {
        return [...getUserTrips(), ...tripsMock];
    }, []);

    const filteredTrips = useMemo(() => {
        return applyTripFilters(allTrips, filters);
    }, [allTrips, filters]);

    return (
        <div className="container stack">
            <h1>Discover trips</h1>

            <TripFilters
                value={filters}
                onChange={setFilters}
                onReset={() => setFilters(defaultTripFilters())}
            />

            <TripList trips={filteredTrips} />
        </div>
    );
}