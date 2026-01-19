import { z } from "zod";

export const tripTypes = ["Training", "Adventure", "Relax", "Delivery"] as const;

export const createOfferSchema = z
    .object({
        title: z.string().trim().min(3, "Title musí mít aspoň 3 znaky."),
        location: z.string().trim().min(2, "Location je povinná."),
        country: z.string().trim().optional().default(""),
        type: z.enum(tripTypes),
        startDate: z.string().min(1, "Start date je povinný."),
        endDate: z.string().min(1, "End date je povinný."),
        priceCzk: z.coerce.number().int().positive("Cena musí být > 0."),
        capacity: z.coerce.number().int().min(1, "Capacity musí být >= 1."),
        highlightsText: z.string().optional().default(""),
        description: z.string().trim().optional().default(""),
    })
    .refine((v) => v.endDate >= v.startDate, {
        message: "End date musí být po start date.",
        path: ["endDate"],
    });

export type CreateOfferForm = z.infer<typeof createOfferSchema>;
