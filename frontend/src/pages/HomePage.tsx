import { useEffect, useMemo, useState } from "react";
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
            <section className="article">
                <article>
                    <h1>Najdi posádku, plavbu nebo kapitána!</h1>
                    <p>Hledáte posádku nebo plavbu snů?
                        Sail Connect propojuje kapitány s dobrodruhy, kteří chtějí objevovat svět po vlnách.
                        Ať už jste zkušený mořský vlk, začínající námořník nebo jen toužíte zažít vítr ve vlasech, u nás
                        najdete perfektní posádku i plavbu.</p>

                    <p>🌊 Najděte svou vysněnou plavbu</p>
                    <p>⚓ Přidejte se k posádce a poznejte nové přátele</p>
                    <p>🌍 Prozkoumejte svět z paluby jachty</p>

                    <p> Přidejte se ke komunitě milovníků moře a nechte se unášet vlnami nových zážitků! Vyplujte s námi
                        ještě dnes!</p>
                </article>
            </section>
            <TripFilters
                value={draft}
                onChange={setDraft}
                onSearch={handleSearch}
                onReset={handleReset}
            />

            <TripList trips={filteredTrips}/>
        </div>
    );
}
