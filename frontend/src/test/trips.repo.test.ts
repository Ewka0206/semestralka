import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Trip } from "../features/trips/types";

vi.mock("../lib/api", () => ({
    apiFetch: vi.fn(),
    authHeaders: vi.fn(() => ({ "X-User-Id": "u1" })),
}));

import { apiFetch } from "../lib/api";
import { addUserTrip, getUserTrips, updateUserTrip, deleteUserTrip } from "../features/trips/repo";

const mockApiFetch = vi.mocked(apiFetch);

const trip: Trip = {
    id: "t1",
    title: "Test trip",
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
    ownerUserId: "u1",
};

describe("trips repo (API)", () => {
    beforeEach(() => {
        mockApiFetch.mockReset();
    });

    it("addUserTrip volá POST /trips a vrátí uložený trip", async () => {
        mockApiFetch.mockResolvedValue(trip);
        const result = await addUserTrip(trip);
        expect(mockApiFetch).toHaveBeenCalledWith("/trips", expect.objectContaining({ method: "POST" }));
        expect(result).toEqual(trip);
    });

    it("getUserTrips volá GET /trips?owner=... když je předáno userId", async () => {
        mockApiFetch.mockResolvedValue([trip]);
        const result = await getUserTrips("u1");
        expect(mockApiFetch).toHaveBeenCalledWith("/trips?owner=u1", expect.any(Object));
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("t1");
    });

    it("getUserTrips volá GET /trips bez parametru když userId chybí", async () => {
        mockApiFetch.mockResolvedValue([trip]);
        await getUserTrips();
        expect(mockApiFetch).toHaveBeenCalledWith("/trips", expect.any(Object));
    });

    it("updateUserTrip volá PUT /trips/:id a vrátí aktualizovaný trip", async () => {
        const updated = { ...trip, title: "Nový název" };
        mockApiFetch.mockResolvedValue(updated);
        const result = await updateUserTrip(updated);
        expect(mockApiFetch).toHaveBeenCalledWith("/trips/t1", expect.objectContaining({ method: "PUT" }));
        expect(result.title).toBe("Nový název");
    });

    it("deleteUserTrip volá DELETE /trips/:id", async () => {
        mockApiFetch.mockResolvedValue(undefined);
        await deleteUserTrip("t1");
        expect(mockApiFetch).toHaveBeenCalledWith("/trips/t1", expect.objectContaining({ method: "DELETE" }));
    });
});
