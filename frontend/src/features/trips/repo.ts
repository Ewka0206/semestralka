import { apiFetch, authHeaders } from "../../lib/api";
import type { Trip } from "./types";
import type { TripFiltersState } from "./utils";

export async function getAllTrips(): Promise<Trip[]> {
    return apiFetch<Trip[]>("/trips");
}

/** Zavolá /api/trips/search s filtry a vrátí pole plaveb (obsah první stránky, size=200). */
export async function searchTrips(filters: TripFiltersState): Promise<Trip[]> {
    const params = new URLSearchParams();
    if (filters.type && filters.type !== "Any") params.set("type", filters.type);
    if (filters.country)                        params.set("country", filters.country);
    if (filters.dateFrom)                       params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo)                         params.set("dateTo", filters.dateTo);
    if (filters.maxPriceCzk != null)            params.set("maxPrice", String(filters.maxPriceCzk));
    if (filters.minFreeSpots != null)           params.set("minFreeSpots", String(filters.minFreeSpots));
    params.set("page", "0");
    params.set("size", "200");
    const page = await apiFetch<{ content: Trip[] }>(`/trips/search?${params.toString()}`);
    return page.content;
}

export async function getUserTrips(ownerUserId?: string): Promise<Trip[]> {
    const query = ownerUserId ? `?owner=${encodeURIComponent(ownerUserId)}` : "";
    return apiFetch<Trip[]>(`/trips${query}`, { headers: authHeaders() });
}

export async function getTripById(id: string): Promise<Trip | null> {
    try {
        return await apiFetch<Trip>(`/trips/${id}`);
    } catch {
        return null;
    }
}

export async function addUserTrip(trip: Omit<Trip, "id"> & { id?: string }): Promise<Trip> {
    return apiFetch<Trip>("/trips", {
        method: "POST",
        body: JSON.stringify(trip),
        headers: authHeaders(),
    });
}

export async function updateUserTrip(trip: Trip): Promise<Trip> {
    return apiFetch<Trip>(`/trips/${trip.id}`, {
        method: "PUT",
        body: JSON.stringify(trip),
        headers: authHeaders(),
    });
}

export async function deleteUserTrip(id: string): Promise<void> {
    await apiFetch<void>(`/trips/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}
