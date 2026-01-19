import { z } from "zod";

export const bookingSchema = z.object({
    contactName: z.string().trim().min(2, "Jméno aspoň 2 znaky."),
    contactEmail: z.string().trim().email("Zadej validní email."),
    seats: z.coerce.number().int().min(1, "Minimálně 1 místo."),
});

export type BookingForm = z.infer<typeof bookingSchema>;
