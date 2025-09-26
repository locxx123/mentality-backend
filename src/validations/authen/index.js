const z = require("zod");

const sendOTPSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
    }),
});

const verifyOTPSchema = z.object({
    body: z.object({
        email: z.string().email(),
        code: z.string().length(6, { message: "OTP must be 6 digits" }),
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

module.exports = {
    sendOTPSchema,
    verifyOTPSchema,
    loginSchema
};