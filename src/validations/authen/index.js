import { z } from "zod";

const sendOTPSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
    }),
});

const sendResetOTPSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
    }),
});

const verifyOTPSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, { message: "Full name must be at least 2 characters long" }),
        email: z.string().email(),
        otp: z.string().length(6, { message: "OTP must be 6 digits" }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters long" }),
    }),
});

const verifyResetOTPSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        otp: z.string().length(6, { message: "OTP must be 6 digits" }),
    }),
});

const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(10, { message: "Token không hợp lệ" }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters long" }),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters long" }),
    }),
});

export {
    sendOTPSchema,
    verifyOTPSchema,
    loginSchema,
    sendResetOTPSchema,
    verifyResetOTPSchema,
    resetPasswordSchema
};