import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export type TripTypeOption = { code: string; label: string };

let cache: TripTypeOption[] | null = null;

async function loadTripTypes(): Promise<TripTypeOption[]> {
    if (cache) return cache;
    cache = await apiFetch<TripTypeOption[]>("/trip-types");
    return cache;
}

export function useTripTypes(): TripTypeOption[] {
    const [types, setTypes] = useState<TripTypeOption[]>(cache ?? []);
    useEffect(() => { loadTripTypes().then(setTypes).catch(() => {}); }, []);
    return types;
}