import { describe, it, expect } from "vitest";
import type { Trip } from "../features/trips/types";
import { applyTripFilters, defaultTripFilters } from "../features/trips/utils";

const trips: Trip[] = [
    {
        id: "1",
        title: "Korfu – rekreační plavba",
        location: "Korfu",
        country: "Řecko",
        type: "Relax",
        startDate: "2026-06-06",
        endDate: "2026-06-13",
        priceCzk: 17000,
        capacity: 8,
        booked: 5,
        skipperIncluded: true,
        highlights: ["4 kajuty"],
        description: "Pohodová plavba.",
    },
    {
        id: "2",
        title: "Trénink manévrů",
        location: "Saronský záliv",
        country: "Řecko",
        type: "Training",
        startDate: "2026-05-16",
        endDate: "2026-05-23",
        priceCzk: 16500,
        capacity: 10,
        booked: 9,
        skipperIncluded: true,
        highlights: ["Manévry"],
        description: "Intenzivní trénink.",
    },
    {
        id: "3",
        title: "Chorvatsko tour",
        location: "Split",
        country: "Chorvatsko",
        type: "Relax",
        startDate: "2026-07-01",
        endDate: "2026-07-08",
        priceCzk: 18000,
        capacity: 6,
        booked: 0,
        skipperIncluded: true,
        highlights: [],
        description: "Plavba podél Dalmácie.",
    },
];

describe("applyTripFilters", () => {
    it("bez filtrů vrátí všechny trips", () => {
        const f = defaultTripFilters();
        const out = applyTripFilters(trips, f);
        expect(out).toHaveLength(3);
    });

    it("filtruje podle typu", () => {
        const f = { ...defaultTripFilters(), type: "Training" as const };
        const out = applyTripFilters(trips, f);
        expect(out.map((t) => t.id)).toEqual(["2"]);
    });

    it("filtruje podle data (dateFrom/dateTo)", () => {
        const f = { ...defaultTripFilters(), dateFrom: "2026-06-01", dateTo: "2026-06-30" };
        const out = applyTripFilters(trips, f);
        expect(out.map((t) => t.id)).toEqual(["1"]);
    });

    it("filtruje podle maxPriceCzk", () => {
        const f = { ...defaultTripFilters(), maxPriceCzk: 16600 };
        const out = applyTripFilters(trips, f);
        expect(out.map((t) => t.id)).toEqual(["2"]);
    });

    it("filtruje podle státu (přesná shoda)", () => {
        const f = { ...defaultTripFilters(), country: "Chorvatsko" };
        const out = applyTripFilters(trips, f);
        expect(out.map((t) => t.id)).toEqual(["3"]);
    });

    it("filtruje podle minFreeSpots", () => {
        // trip 1: 8-5=3 volná, trip 2: 10-9=1 volné, trip 3: 6-0=6 volných
        const f = { ...defaultTripFilters(), minFreeSpots: 3 };
        const out = applyTripFilters(trips, f);
        expect(out.map((t) => t.id)).toEqual(["1", "3"]);
    });

    it("prázdný filtr státu vrátí vše", () => {
        const f = { ...defaultTripFilters(), country: "" };
        const out = applyTripFilters(trips, f);
        expect(out).toHaveLength(3);
    });
});
