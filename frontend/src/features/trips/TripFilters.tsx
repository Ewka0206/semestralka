import { useTripTypes } from "./useTripTypes";
import type { TripFiltersState } from "./utils.ts";

type Props = {
    value: TripFiltersState;
    onChange: (next: TripFiltersState) => void;
    onSearch: () => void;
    onReset: () => void;
};

export function TripFilters({ value, onChange, onSearch, onReset }: Props) {
    const tripTypes = useTripTypes();
    const idQ = "tripFilters-q";
    const idType = "tripFilters-type";
    const idFrom = "tripFilters-from";
    const idTo = "tripFilters-to";
    const idPrice = "tripFilters-price";

    return (
        <section className="card stack" aria-labelledby="tripFiltersTitle">
            <h2 id="tripFiltersTitle" className="sectionTitle">
                Filtr
            </h2>

            <form
                className="grid2"
                role="search"
                aria-label="Filtrování plaveb"
                onSubmit={(e) => { e.preventDefault(); onSearch(); }}
            >
                <div className="field">
                    <label htmlFor={idQ}>Destinace</label>
                    <input
                        id={idQ}
                        value={value.q}
                        onChange={(e) => onChange({ ...value, q: e.target.value })}
                        placeholder="Korfu / Athény / Skotsko / Severní moře…"
                        autoComplete="off"
                        inputMode="search"
                    />
                </div>

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
                            <option key={t.code} value={t.code}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label htmlFor={idFrom}>Datum od</label>
                    <input
                        id={idFrom}
                        type="date"
                        value={value.dateFrom}
                        onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
                    />
                </div>

                <div className="field">
                    <label htmlFor={idTo}>Datum do</label>
                    <input
                        id={idTo}
                        type="date"
                        value={value.dateTo}
                        onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
                        min={value.dateFrom || undefined}
                    />
                </div>

                <div className="field">
                    <label htmlFor={idPrice}>Maximální cena (CZK)</label>
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
                        placeholder="např. 18000"
                        inputMode="numeric"
                    />
                </div>

                <div className="filterBtns">
                    <button className="btn" type="submit">Hledat</button>
                    <button className="btn btnOutline" type="button" onClick={onReset}>Vymazat filtry</button>
                </div>
            </form>
        </section>
    );
}