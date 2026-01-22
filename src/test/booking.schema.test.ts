import { describe, it, expect } from "vitest";
import { bookingSchema } from "../features/bookings/schemas";

describe("bookingSchema", () => {
    it("validní data projdou", () => {
        const res = bookingSchema.safeParse({
            contactName: "Efka",
            contactEmail: "efka@email.cz",
            seats: 2,
        });

        expect(res.success).toBe(true);
    });

    it("nevalidní email neprojde", () => {
        const res = bookingSchema.safeParse({
            contactName: "Efka",
            contactEmail: "spatne",
            seats: 2,
        });

        expect(res.success).toBe(false);
    });

    it("seats < 1 neprojde", () => {
        const res = bookingSchema.safeParse({
            contactName: "Efka",
            contactEmail: "efka@email.cz",
            seats: 0,
        });

        expect(res.success).toBe(false);
    });

    it("jméno kratší než minimum neprojde", () => {
        const res = bookingSchema.safeParse({
            contactName: "E",
            contactEmail: "efka@email.cz",
            seats: 1,
        });

        expect(res.success).toBe(false);
    });
});