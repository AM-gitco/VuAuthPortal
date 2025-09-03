import { z } from "zod";

export const otpSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6, "Verification code must be 6 digits").max(6),
});

export type OtpData = z.infer<typeof otpSchema>;

// Existing schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginData = z.infer<typeof loginSchema>;

export const insertUserSchema = z.object({
  fullName: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;