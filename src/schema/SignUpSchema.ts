import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    about: z.string().min(10, { message: "About section must be at least 10 characters" }),
    gender: z.enum(["MALE", "FEMALE", "OTHERS"]),
    purpose: z.enum(["PERSONAL", "BUSINESS", "EDUCATION"]),
    profileImage: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });