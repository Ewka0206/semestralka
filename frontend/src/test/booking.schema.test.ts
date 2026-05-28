import { describe, it, expect } from "vitest";
import { bookingSchema } from "../features/bookings/schemas";

describe("bookingSchema", () => {
    it("validní data projdou", () => {
        const res = bookingSchema.safeParse({ seats: 2 });
        expect(res.success).toBe(true);
    });

    it("seats < 1 neprojde", () => {
        const res = bookingSchema.safeParse({ seats: 0 });
        expect(res.success).toBe(false);
    });

    it("záporný počet míst neprojde", () => {
        const res = bookingSchema.safeParse({ seats: -3 });
        expect(res.success).toBe(false);
    });

    it("chybějící seats neprojde", () => {
        const res = bookingSchema.safeParse({});
        expect(res.success).toBe(false);
    });

    it("desetinný počet míst neprojde", () => {
        const res = bookingSchema.safeParse({ seats: 1.5 });
        expect(res.success).toBe(false);
    });
});
