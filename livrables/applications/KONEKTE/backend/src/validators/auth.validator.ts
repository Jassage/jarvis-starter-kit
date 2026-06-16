import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  firstName: z.string().min(2, "Le prénom est requis"),
  birthDate: z.string().refine((d) => {
    const date = new Date(d);
    const age = Math.floor(
      (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return age >= 18;
  }, "Vous devez avoir au moins 18 ans"),
  gender: z.enum(["HOMME", "FEMME", "AUTRE"]),
  city: z.string().min(2, "La ville est requise"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
