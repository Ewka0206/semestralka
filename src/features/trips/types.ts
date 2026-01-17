export type TripType = "Training" | "Adventure" | "Relax" | "Delivery";

export type Trip = {
    id: string;
    title: string;

    // místo destination/location dej jednotně location
    location: string;      // "Korfu", "Saronic Gulf", ...
    country: string;

    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD

    // sjednotit cenu – ať to je jedna cena
    priceCzk: number;

    capacity: number;
    booked: number;

    type: TripType;

    skipperIncluded: boolean;

    highlights: string[];

    // popis může být volitelný, ať nemusíš všude psát romány
    description?: string;
};
