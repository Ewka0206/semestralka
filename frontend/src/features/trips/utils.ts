import type { Trip, TripType } from "./types.ts";

export type TripFiltersState = {
    type: TripType | "Any";
    country: string;        // "" = vše, jinak přesný název státu
    dateFrom: string;       // "" nebo YYYY-MM-DD
    dateTo: string;         // "" nebo YYYY-MM-DD
    maxPriceCzk: number | null;
    minFreeSpots: number | null;
};

export function defaultTripFilters(): TripFiltersState {
    return {
        type: "Any",
        country: "",
        dateFrom: "",
        dateTo: "",
        maxPriceCzk: null,
        minFreeSpots: null,
    };
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

        if (f.minFreeSpots !== null) {
            const free = t.capacity - (t.booked ?? 0);
            if (free < f.minFreeSpots) {
                return false;
            }
        }

        return true;
    });
}
