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
                value={filters}
                onChange={setFilters}
                onReset={() => setFilters(defaultTripFilters())}
            />

            <TripList trips={filteredTrips}/>
        </div>
    );
}