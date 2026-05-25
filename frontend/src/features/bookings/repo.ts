import { apiFetch, authHeaders } from "../../lib/api";
import type { Booking } from "./types";

export async function getBookings(): Promise<Booking[]> {
    return apiFetch<Booking[]>("/bookings", { headers: authHeaders() });
}

export async function getBookingById(id: string): Promise<Booking | null> {
    try {
        return await apiFetch<Booking>(`/bookings/${id}`, { headers: authHeaders() });
    } catch {
        return null;
    }
}

export async function addBooking(booking: Omit<Booking, "id"> & { id?: string }): Promise<Booking> {
    return apiFetch<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify(booking),
        headers: authHeaders(),
    });
}

export async function updateBooking(booking: Booking): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${booking.id}`, {
        method: "PUT",
        body: JSON.stringify(booking),
        headers: authHeaders(),
    });
}

export async function deleteBooking(id: string): Promise<void> {
    await apiFetch<void>(`/bookings/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}
