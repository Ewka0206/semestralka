import type { Trip, TripType } from "./types.ts";

export type TripFiltersState = {
    q: string;
    type: TripType | "Any";
    country: string;       // "" = vše, jinak přesný název státu
    dateFrom: string;      // "" nebo YYYY-MM-DD
    dateTo: string;        // "" nebo YYYY-MM-DD
    maxPriceCzk: number | null;
};

export function defaultTripFilters(): TripFiltersState {
    return {
        q: "",
        type: "Any",
        country: "",
        dateFrom: "",
        dateTo: "",
        maxPriceCzk: null,
    };
}

function includesCI(haystack: string, needle: string) {
    return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function formatDateRange(from: string | Date, to: string | Date) {
    const a = new Date(from);
    const b = new Date(to);

    const fmt = new Intl.DateTimeFormat("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });

    if (a.toDateString() === b.toDateString()) return fmt.format(a);

    return `${fmt.format(a)} – ${fmt.format(b)}`;
}

export function applyTripFilters(trips: Trip[], f: TripFiltersState): Trip[] {
    return trips.filter((t) => {

        if (f.q.trim()) {
            const q = f.q.trim();
            const ok =
                includesCI(t.title, q) ||
                includesCI(t.location, q) ||
                includesCI(t.country ?? "", q) ||
                includesCI(t.description ?? "", q) ||
                includesCI(t.type, q);
            if (!ok) return false;
        }

        if (f.type !== "Any" && t.type !== f.type) {
            return false;
        }

        if (f.country && t.country !== f.country) {
            return false;
        }

        if (f.dateFrom) {
            if (t.startDate < f.dateFrom) {
                return false;
            }
        }

        if (f.dateTo) {
            if (t.endDate > f.dateTo) {
                return false;
            }
        }

        if (f.maxPriceCzk !== null) {
            if (t.priceCzk > f.maxPriceCzk) {
                return false;
            }
        }

        return true;
    });
}
