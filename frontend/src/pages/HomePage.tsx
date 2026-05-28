import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { TripFilters } from "../features/trips/TripFilters";
import { TripList } from "../features/trips/TripList";
import { applyTripFilters, defaultTripFilters } from "../features/trips/utils";
import { getAllTrips } from "../features/trips/repo";
import type { Trip } from "../features/trips/types";

export function HomePage() {
    usePageTitle("Sail Connect – Najdi plavbu nebo posádku");
    const [draft, setDraft] = useState(defaultTripFilters());
    const [applied, setApplied] = useState(defaultTripFilters());
    const [allTrips, setAllTrips] = useState<Trip[]>([]);

    useEffect(() => {
        getAllTrips().then(setAllTrips).catch(console.error);
    }, []);

    const filteredTrips = useMemo(() => {
        return applyTripFilters(allTrips, applied);
    }, [allTrips, applied]);

    function handleSearch() {
        setApplied(draft);
    }

    function handleReset() {
        const def = defaultTripFilters();
        setDraft(def);
        setApplied(def);
    }

    return (
        <div className="container stack">
            <section className="hero">
                <div className="heroContent">
                    <span className="heroEyebrow">⚓ SailConnect</span>
                    <h1 className="heroTitle">Najdi svou plavbu snů</h1>
                    <p className="heroSub">
                        Propojujeme kapitány s dobrodruhy, kteří chtějí objevovat svět po vlnách.
                        Ať už jsi zkušený mořský vlk nebo začínající námořník – tady je tvá posádka.
                    </p>
                    <div className="heroActions">
                        <a href="#nabidky" className="btn btnLg">Procházet plavby</a>
                        <Link to="/offers/new" className="btn btnLg btnOutline">Přidat nabídku</Link>
                    </div>
                </div>
            </section>

            <div className="stack" id="nabidky">
                <h2 className="sectionTitle">Aktuální nabídky plaveb</h2>
                <TripFilters
                    value={draft}
                    onChange={setDraft}
                    onSearch={handleSearch}
                    onReset={handleReset}
                />
                <TripList trips={filteredTrips} />
            </div>
        </div>
    );
}
