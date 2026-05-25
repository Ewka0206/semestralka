import { apiFetch, authHeaders } from "../../lib/api";
import type { Trip } from "./types";

export async function getAllTrips(): Promise<Trip[]> {
    return apiFetch<Trip[]>("/trips");
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
