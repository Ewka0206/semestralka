import { describe, it, expect } from "vitest";
import { createOfferSchema } from "../features/trips/schemas";

describe("createOfferSchema", () => {
    it("validní nabídka projde", () => {
        const res = createOfferSchema.safeParse({
            title: "Korfu – rekreační plavba",
            location: "Korfu",
            country: "Řecko",
            type: "Rekreace",
            startDate: "2026-06-06",
            endDate: "2026-06-13",
            priceCzk: 17000,
            capacity: 8,
            highlightsText: "4 kajuty\nLoď + kapitán",
            description: "Pohodová plavba.",
        });

        expect(res.success).toBe(true);
    });

    it("priceCzk <= 0 neprojde", () => {
        const res = createOfferSchema.safeParse({
            title: "X",
            location: "Y",
            country: "Z",
            type: "Rekreace",
            startDate: "2026-06-06",
            endDate: "2026-06-13",
            priceCzk: 0,
            capacity: 8,
            highlightsText: "",
            description: "",
        });

        expect(res.success).toBe(false);
    });

    it("capacity < 1 neprojde", () => {
        const res = createOfferSchema.safeParse({
            title: "X",
            location: "Y",
            country: "Z",
            type: "Rekreace",
            startDate: "2026-06-06",
            endDate: "2026-06-13",
            priceCzk: 100,
            capacity: 0,
            highlightsText: "",
            description: "",
        });

        expect(res.success).toBe(false);
    });
});
