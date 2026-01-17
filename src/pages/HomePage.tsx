import { useMemo, useState } from "react";
import { tripsMock } from "../data/tripsMock.ts";

import { TripFilters } from "../features/trips/TripFilters.tsx";
import { TripList } from "../features/trips/TripList.tsx";
import { applyTripFilters, defaultTripFilters } from "../features/trips/utils.ts";

export function HomePage() {
    const [filters, setFilters] = useState(defaultTripFilters());

    const filteredTrips = useMemo(() => {
        return applyTripFilters(tripsMock, filters);
    }, [filters]);

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