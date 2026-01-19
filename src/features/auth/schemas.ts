import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().trim().email("Zadej validní email."),
    password: z.string().min(4, "Heslo aspoň 4 znaky."),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Jméno aspoň 2 znaky."),
    email: z.string().trim().email("Zadej validní email."),
    password: z.string().min(4, "Heslo aspoň 4 znaky."),
    role: z.enum(["crew", "captain"]),
});

export type RegisterForm = z.infer<typeof registerSchema>;
