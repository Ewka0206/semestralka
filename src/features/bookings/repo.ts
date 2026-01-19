import { readJson, writeJson } from "../../lib/storage";
import type { Booking } from "./types";

const KEY = "sailconnect_bookings_v1";

export function getBookings(): Booking[] {
    return readJson<Booking[]>(KEY, []);
}

export function addBooking(b: Booking): void {
    const curr = getBookings();
    writeJson(KEY, [b, ...curr]);
}
export function getBookingById(id: string): Booking | null {
    return getBookings().find((b) => b.id === id) ?? null;
}

export function updateBooking(updated: Booking): void {
    const curr = getBookings();
    const next = curr.map((b) => (b.id === updated.id ? updated : b));
    writeJson(KEY, next);
}

export function deleteBooking(id: string): void {
    const curr = getBookings();
    writeJson(KEY, curr.filter((b) => b.id !== id));
}