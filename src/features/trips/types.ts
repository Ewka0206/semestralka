export type TripType = "Training" | "Adventure" | "Relax";

export type Trip = {
    id: string;
    title: string;
    location: string;
    country?: string;
    type: TripType;

    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD

    priceCzk: number;
    capacity: number;

    booked?: number;
    skipperIncluded?: boolean;
    highlights?: string[];
    description?: string;

    ownerUserId?: string;
};