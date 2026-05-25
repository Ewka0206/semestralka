import { describe, it, expect } from "vitest";
import type { Trip } from "../features/trips/types";
import { applyTripFilters, defaultTripFilters } from "../features/trips/utils";

const trips: Trip[] = [
    {
        id: "1",
        title: "Korfu – rekreační plavba",
        location: "Korfu",
        country: "Řecko",
        type: "Rekreace" as any,
        startDate: "2026-06-06",
        endDate: "2026-06-13",
        priceCzk: 17000,
        capacity: 8,
        booked: 0,
        skipperIncluded: true,
        highlights: ["4 kajuty"],
        description: "Pohodová plavba.",
    },
    {
        id: "2",
        title: "Trénink manévrů",
        location: "Saronský záliv",
        country: "Řecko",
        type: "Trénink" as any,
        startDate: "2026-05-16",
        endDate: "2026-05-23",
        priceCzk: 16500,
        capacity: 10,
        booked: 0,
        skipperIncluded: true,
        highlights: ["Manévry"],
        description: "Intenzivní trénink.",
    },
];

describe("applyTripFilters", () => {
    it("bez filtrů vrátí všechny trips", () => {
        const f = defaultTripFilters();
        const out = applyTripFilters(trips, f);
        expect(out).toHaveLength(2);
    });

    it("filtruje podle textu (q) case-insensitive", () => {
        const f = { ...defaultTripFilters(), q: "kOrFu" };
        const out = applyTripFilters(trips, f);
        expect(out.map((t) => t.id)).toEqual(["1"]);
    });

    it("filtruje podle typu", () => {
        const f = { ...defaultTripFilters(), type: "Trénink" as any };
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

    it("filtruje podle země (q prohledává i country)", () => {
        const f = { ...defaultTripFilters(), q: "Řecko" };
        const out = applyTripFilters(trips, f);
        expect(out).toHaveLength(2);
    });

    it("filtruje podle části názvu země case-insensitive", () => {
        const tripWithDifferentCountry: Trip = {
            id: "3",
            title: "Chorvatsko tour",
            location: "Split",
            country: "Chorvatsko",
            type: "Rekreace" as any,
            startDate: "2026-07-01",
            endDate: "2026-07-08",
            priceCzk: 18000,
            capacity: 6,
            booked: 0,
            skipperIncluded: true,
            highlights: [],
            description: "Plavba podél Dalmácie.",
        };
        const f = { ...defaultTripFilters(), q: "chorvatsko" };
        const out = applyTripFilters([...trips, tripWithDifferentCountry], f);
        expect(out.map((t) => t.id)).toEqual(["3"]);
    });
});