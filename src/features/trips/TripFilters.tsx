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
    return (
        <div className="card stack">
            <div className="grid2">
                <div className="field">
                    <label>Destinace</label>
                    <input
                        value={value.q}
                        onChange={(e) => onChange({ ...value, q: e.target.value })}
                        placeholder="Korfu / Řecko / trénink…"
                    />
                </div>

                <div className="field">
                    <label>Typ plavby</label>
                    <select
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
                    <label>Datum od</label>
                    <input
                        type="date"
                        value={value.dateFrom}
                        onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
                    />
                </div>

                <div className="field">
                    <label>Datum do</label>
                    <input
                        type="date"
                        value={value.dateTo}
                        onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
                    />
                </div>

                <div className="field">
                    <label>Maximální cena (CZK)</label>
                    <input
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
                    />
                </div>

                <div className="field actionsRow">
                    <label>&nbsp;</label>
                    <button className="btn" type="button" onClick={onReset}>
                        Vymazat filtry
                    </button>
                </div>
            </div>
        </div>
    );
}