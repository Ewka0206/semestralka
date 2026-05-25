import { describe, it, expect, beforeEach } from "vitest";
import type { Trip } from "../features/trips/types";
import { addUserTrip, getUserTrips, deleteUserTrip } from "../features/trips/repo";
import { updateUserTrip } from "../features/trips/repo";

describe("trips repo (LocalStorage)", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("addUserTrip uloží trip a getUserTrips ho vrátí", () => {
        const t: Trip = {
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
            highlights: ["A"],
            description: "Popis",
            ownerUserId: "u1",
            imageUrl: "https://example.com/img.jpg" as any,
        };

        addUserTrip(t);

        const all = getUserTrips();
        expect(all).toHaveLength(1);
        expect(all[0].id).toBe("t1");
        expect(all[0].title).toBe("Test trip");
    });

    it("deleteUserTrip odstraní trip", () => {
        addUserTrip({
            id: "t1",
            title: "A",
            location: "X",
            country: "Y",
            type: "Rekreace" as any,
            startDate: "2026-06-06",
            endDate: "2026-06-13",
            priceCzk: 100,
            capacity: 2,
            booked: 0,
            skipperIncluded: true,
            highlights: [],
            description: "—",
            ownerUserId: "u1",
        } as Trip);

        deleteUserTrip("t1");
        expect(getUserTrips()).toHaveLength(0);
    });

    it("updateUserTrip přepíše trip", () => {
      addUserTrip({
        id: "t1",
        title: "Old",
        location: "X",
        country: "Y",
        type: "Rekreace" as any,
        startDate: "2026-06-06",
        endDate: "2026-06-13",
        priceCzk: 100,
        capacity: 2,
        booked: 0,
        skipperIncluded: true,
        highlights: [],
        description: "—",
        ownerUserId: "u1",
      } as Trip);

      updateUserTrip({
        id: "t1",
        title: "New",
        location: "X",
        country: "Y",
        type: "Rekreace" as any,
        startDate: "2026-06-06",
        endDate: "2026-06-13",
        priceCzk: 100,
        capacity: 2,
        booked: 0,
        skipperIncluded: true,
        highlights: [],
        description: "—",
        ownerUserId: "u1",
      } as Trip);

      const all = getUserTrips();
      expect(all[0].title).toBe("New");
    });
});
