import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Infer TypeScript types from the schemas (replaces your manual interfaces)
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: "ADMIN" | "USER";
    }
}