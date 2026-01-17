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
