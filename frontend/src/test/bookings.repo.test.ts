import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Booking } from "../features/bookings/types";

vi.mock("../lib/api", () => ({
    apiFetch: vi.fn(),
    authHeaders: vi.fn(() => ({ "X-User-Id": "u1" })),
}));

import { apiFetch } from "../lib/api";
import { addBooking, getBookings, updateBooking, deleteBooking } from "../features/bookings/repo";

const mockApiFetch = vi.mocked(apiFetch);

const booking: Booking = {
    id: "b1",
    tripId: "t1",
    createdAt: "2026-01-01T10:00:00.000Z",
    seats: 2,
    contactName: "Efka",
    contactEmail: "efka@email.cz",
};

describe("bookings repo (API)", () => {
    beforeEach(() => {
        mockApiFetch.mockReset();
    });

    it("addBooking volá POST /bookings a vrátí uložený booking", async () => {
        mockApiFetch.mockResolvedValue(booking);
        const result = await addBooking(booking);
        expect(mockApiFetch).toHaveBeenCalledWith("/bookings", expect.objectContaining({ method: "POST" }));
        expect(result).toEqual(booking);
    });

    it("getBookings volá GET /bookings a vrátí seznam", async () => {
        mockApiFetch.mockResolvedValue([booking]);
        const result = await getBookings();
        expect(mockApiFetch).toHaveBeenCalledWith("/bookings", expect.any(Object));
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("b1");
    });

    it("updateBooking volá PUT /bookings/:id a vrátí aktualizovaný booking", async () => {
        const updated = { ...booking, seats: 3, contactName: "Nové jméno" };
        mockApiFetch.mockResolvedValue(updated);
        const result = await updateBooking(updated);
        expect(mockApiFetch).toHaveBeenCalledWith("/bookings/b1", expect.objectContaining({ method: "PUT" }));
        expect(result.seats).toBe(3);
        expect(result.contactName).toBe("Nové jméno");
    });

    it("deleteBooking volá DELETE /bookings/:id", async () => {
        mockApiFetch.mockResolvedValue(undefined);
        await deleteBooking("b1");
        expect(mockApiFetch).toHaveBeenCalledWith("/bookings/b1", expect.objectContaining({ method: "DELETE" }));
    });
});
