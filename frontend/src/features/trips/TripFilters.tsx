import { useTripTypes } from "./useTripTypes";
import { useCountries } from "./useCountries";
import type { TripFiltersState } from "./utils.ts";

type Props = {
    value: TripFiltersState;
    onChange: (next: TripFiltersState) => void;
    onSearch: () => void;
    onReset: () => void;
};

export function TripFilters({ value, onChange, onSearch, onReset }: Props) {
    const tripTypes = useTripTypes();
    const countries = useCountries();

    const idCountry   = "tripFilters-country";
    const idType      = "tripFilters-type";
    const idFrom      = "tripFilters-from";
    const idTo        = "tripFilters-to";
    const idPrice     = "tripFilters-price";
    const idFreeSpots = "tripFilters-freeSpots";

    return (
        <section className="card stack" aria-labelledby="tripFiltersTitle">
            <h2 id="tripFiltersTitle" className="sectionTitle">Filtr</h2>

            <form
                className="filterGrid"
                role="search"
                aria-label="Filtrování plaveb"
                onSubmit={(e) => { e.preventDefault(); onSearch(); }}
            >
                {/* Řádek 1: Typ plavby + Stát */}
                <div className="field">
                    <label htmlFor={idType}>Typ plavby</label>
                    <select
                        id={idType}
                        value={value.type}
                        onChange={(e) =>
                            onChange({ ...value, type: e.target.value as TripFiltersState["type"] })
                        }
                    >
                        <option value="Any">Cokoliv</option>
                        {tripTypes.map((t) => (
                            <option key={t.code} value={t.code}>{t.label}</option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label htmlFor={idCountry}>Stát</label>
                    <select
                        id={idCountry}
                        value={value.country}
                        onChange={(e) => onChange({ ...value, country: e.target.value })}
                    >
                        <option value="">Všechny státy</option>
                        {countries.map((c) => (
                            <option key={c.code} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Řádek 2: Termín od + Termín do */}
                <div className="field">
                    <label htmlFor={idFrom}>Termín od</label>
                    <input
                        id={idFrom}
                        type="date"
                        value={value.dateFrom}
                        onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
                    />
                </div>

                <div className="field">
                    <label htmlFor={idTo}>Termín do</label>
                    <input
                        id={idTo}
                        type="date"
                        value={value.dateTo}
                        onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
                        min={value.dateFrom || undefined}
                    />
                </div>

                {/* Řádek 3: Maximální cena + Volná místa */}
                <div className="field">
                    <label htmlFor={idPrice}>Maximální cena (Kč)</label>
                    <input
                        id={idPrice}
                        type="number"
                        min={0}
                        value={value.maxPriceCzk ?? ""}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                maxPriceCzk: e.target.value === "" ? null : Number(e.target.value),
                            })
                        }
                        placeholder="např. 20 000"
                        inputMode="numeric"
                    />
                </div>

                <div className="field">
                    <label htmlFor={idFreeSpots}>Min. volných míst</label>
                    <input
                        id={idFreeSpots}
                        type="number"
                        min={1}
                        value={value.minFreeSpots ?? ""}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                minFreeSpots: e.target.value === "" ? null : Number(e.target.value),
                            })
                        }
                        placeholder="např. 2"
                        inputMode="numeric"
                    />
                </div>

                {/* Tlačítka přes celou šířku */}
                <div className="filterBtns">
                    <button className="btn" type="submit">Hledat</button>
                    <button className="btn btnOutline" type="button" onClick={onReset}>Vymazat filtry</button>
                </div>
            </form>
        </section>
    );
}
