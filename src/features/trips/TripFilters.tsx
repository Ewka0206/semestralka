import type { TripType } from "./types.ts";
import { tripTypeLabels } from "./i18n";
import type { TripFiltersState } from "./utils.ts";

const types: Array<TripType | "Any"> = ["Any", "Training", "Adventure", "Relax"];

type Props = {
    value: TripFiltersState;
    onChange: (next: TripFiltersState) => void;
    onReset: () => void;
};

export function TripFilters({ value, onChange, onReset }: Props) {
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
                aria-label="Filtrování nabídky plaveb"
                onSubmit={(e) => e.preventDefault()}
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
                        {types.map((t) => (
                            <option key={t} value={t}>
                                {t === "Any" ? "Cokoliv" : tripTypeLabels[t]}
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

                {}
                <div className="field" style={{ alignSelf: "end" }}>
                    <button className="btn" type="button" onClick={onReset}>
                        Vymazat filtry
                    </button>
                </div>
            </form>
        </section>
    );
}