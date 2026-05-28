import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { TripFilters } from "../features/trips/TripFilters";
import { TripList } from "../features/trips/TripList";
import { defaultTripFilters, type TripFiltersState } from "../features/trips/utils";
import { searchTrips } from "../features/trips/repo";
import { useAuth } from "../features/auth/AuthContext";
import type { Trip } from "../features/trips/types";

export function HomePage() {
    usePageTitle("Sail Connect – Najdi plavbu nebo posádku");
    const { user } = useAuth();
    const isCaptain = user?.role === "captain";
    const location = useLocation();
    const [draft, setDraft] = useState<TripFiltersState>(defaultTripFilters());
    const [trips, setTrips] = useState<Trip[]>([]);
    const [activeFilters, setActiveFilters] = useState<TripFiltersState>(defaultTripFilters());

    // Načti plavby ze serveru s aktuálními filtry – volá se při každé navigaci
    // na homepage i po kliknutí na Hledat (data vždy čerstvá z DB)
    const fetchTrips = useCallback((filters: TripFiltersState) => {
        searchTrips(filters).then(setTrips).catch(console.error);
    }, []);

    useEffect(() => {
        fetchTrips(activeFilters);
    }, [location.key]);  // refresh při každém příchodu na stránku

    function handleSearch() {
        setActiveFilters(draft);
        fetchTrips(draft);
    }

    function handleReset() {
        const def = defaultTripFilters();
        setDraft(def);
        setActiveFilters(def);
        fetchTrips(def);
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
                        {isCaptain && (
                            <Link to="/offers/new" className="btn btnLg btnOutline">Přidat plavbu</Link>
                        )}
                        {!user && (
                            <Link to="/register" className="btn btnLg btnOutline">Registrovat se zdarma</Link>
                        )}
                    </div>
                </div>
            </section>

            <div className="stack" id="nabidky">
                <h2 className="sectionTitle">Aktuální plavby</h2>
                <TripFilters
                    value={draft}
                    onChange={setDraft}
                    onSearch={handleSearch}
                    onReset={handleReset}
                />
                <TripList trips={trips} />
            </div>
        </div>
    );
}
