import { z } from "zod";

export const bookingSchema = z.object({
    seats: z.coerce
        .number()
        .int()
        .min(1, "Minimálně 1 místo.")
        .finite("Počet míst musí být číslo."),
});

export type BookingForm = z.infer<typeof bookingSchema>;
