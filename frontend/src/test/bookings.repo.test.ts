import { describe, it, expect, beforeEach } from "vitest";
import type { Booking } from "../features/bookings/types";
import { addBooking, getBookings, deleteBooking, updateBooking } from "../features/bookings/repo";

describe("bookings repo (LocalStorage)", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("addBooking uloží booking a getBookings ho vrátí", () => {
        const b: Booking = {
            id: "b1",
            tripId: "t1",
            createdAt: "2026-01-01T10:00:00.000Z",
            seats: 2,
            contactName: "Efka",
            contactEmail: "efka@email.cz",
        };

        addBooking(b);

        const all = getBookings();
        expect(all).toHaveLength(1);
        expect(all[0].id).toBe("b1");
        expect(all[0].seats).toBe(2);
    });

    it("updateBooking přepíše booking", () => {
        addBooking({
            id: "b1",
            tripId: "t1",
            createdAt: "2026-01-01T10:00:00.000Z",
            seats: 1,
            contactName: "A",
            contactEmail: "a@a.cz",
        });

        updateBooking({
            id: "b1",
            tripId: "t1",
            createdAt: "2026-01-01T10:00:00.000Z",
            seats: 3,
            contactName: "B",
            contactEmail: "b@b.cz",
        });

        const all = getBookings();
        expect(all).toHaveLength(1);
        expect(all[0].seats).toBe(3);
        expect(all[0].contactName).toBe("B");
    });

    it("deleteBooking odstraní booking", () => {
        addBooking({
            id: "b1",
            tripId: "t1",
            createdAt: new Date().toISOString(),
            seats: 1,
            contactName: "A",
            contactEmail: "a@a.cz",
        });

        deleteBooking("b1");
        expect(getBookings()).toHaveLength(0);
    });
});