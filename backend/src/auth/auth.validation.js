import { z } from "zod";


const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
    "Password must contain uppercase, lowercase, number, and special character.",
  );


const emailSchema = z
  .email("Invalid email address")
  .trim()
  .toLowerCase()
  .transform((email) => email.toLowerCase());

const registerSchema = z.object({
  username: z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username cannot exceed 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers and underscores",
  ),

  email: emailSchema,

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[a-z]/, "Must contain one lowercase letter")
    .regex(/[0-9]/, "Must contain one number")
    .regex(/[^A-Za-z0-9]/, "Must contain one special character"),
});

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const resendVerificationSchema = z.object({
  email: emailSchema,
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),

  password: passwordSchema,
});

const changePasswordSchema = z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: "New password must be different from the current password.",
      path: ["newPassword"],
    },
  );

const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    )
    .optional(),
  email: z.string().email("Invalid email address").trim().toLowerCase().optional(),
  avatar: z.string().optional(),
});

export {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
};
