import { readJson, writeJson } from "../../lib/storage";
import type { Trip } from "./types";

const KEY = "sailconnect_trips_v1";

export function getUserTrips(): Trip[] {
    return readJson<Trip[]>(KEY, []);
}

export function addUserTrip(trip: Trip): void {
    const curr = getUserTrips();
    writeJson(KEY, [trip, ...curr]);
}