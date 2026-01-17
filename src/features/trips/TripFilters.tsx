import type { TripType } from "./types.ts";
import type { TripFiltersState } from "./utils.ts";

const types: Array<TripType | "Any"> = ["Any", "Training", "Adventure", "Relax", "Delivery"];

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
                    <label>Search</label>
                    <input
                        value={value.q}
                        onChange={(e) => onChange({ ...value, q: e.target.value })}
                        placeholder="Korfu / Greece / training…"
                    />
                </div>

                <div className="field">
                    <label>Type</label>
                    <select
                        value={value.type}
                        onChange={(e) => onChange({ ...value, type: e.target.value as TripFiltersState["type"] })}
                    >
                        {types.map((t) => (
                            <option key={t} value={t}>
                                {t === "Any" ? "Any" : t}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>Date from</label>
                    <input
                        type="date"
                        value={value.dateFrom}
                        onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
                    />
                </div>

                <div className="field">
                    <label>Date to</label>
                    <input
                        type="date"
                        value={value.dateTo}
                        onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
                    />
                </div>

                <div className="field">
                    <label>Max price (CZK)</label>
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
                        placeholder="e.g. 18000"
                    />
                </div>

                <div className="field actionsRow">
                    <label>&nbsp;</label>
                    <button className="btn" type="button" onClick={onReset}>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
