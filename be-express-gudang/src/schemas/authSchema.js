import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  email: z.string().email("Email tidak valid"),
  no_hp: z.string().min(8, "no telephone minimal 8 nomor"),
  role: z.enum(["admin", "user", "super admin"], "role tidak valid").default("user"),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});
