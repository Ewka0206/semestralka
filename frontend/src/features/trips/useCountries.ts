import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export type CountryOption = { code: string; name: string };

export function useCountries(): CountryOption[] {
    const [countries, setCountries] = useState<CountryOption[]>([]);

    useEffect(() => {
        apiFetch<CountryOption[]>("/countries")
            .then(setCountries)
            .catch(() => setCountries([]));
    }, []);

    return countries;
}
