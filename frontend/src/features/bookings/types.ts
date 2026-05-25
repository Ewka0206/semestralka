export type Booking = {
    id: string;
    tripId: string;
    createdAt: string; // ISO
    seats: number;
    contactName: string;
    contactEmail: string;
    userId?: string;
};
