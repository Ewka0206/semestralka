import { z } from "zod";

export const createOfferSchema = z
    .object({
        title: z.string().trim().min(3, "Název musí mít aspoň 3 znaky."),
        location: z.string().trim().min(2, "Destinace je povinná."),
        country: z.string().trim().default(""),
        type: z.string().min(1, "Typ plavby je povinný."),
        startDate: z.string().min(1, "Datum od je povinné."),
        endDate: z.string().min(1, "Datum do je povinné."),
        priceCzk: z.coerce.number().int().positive("Cena musí být venší než 0."),
        capacity: z.coerce.number().int().min(1, "Počet míst musí být alespoň 1."),
        highlightsText: z.string().default(""),
        description: z.string().trim().default(""),
        imageUrl: z.string().trim().optional().or(z.literal("")),
    })
    .refine((v) => v.endDate >= v.startDate, {
        message: "Datum do musí být větší než datum od",
        path: ["endDate"],
    });

export type CreateOfferForm = z.infer<typeof createOfferSchema>;