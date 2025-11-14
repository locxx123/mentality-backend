import { z } from "zod";

const sendMessageSchema = z.object({
    body: z.object({
        message: z.string().min(1, { message: "Message cannot be empty" }).max(1000, { message: "Message too long" }),
        sessionId: z.string().min(1, { message: "Session ID is required" }),
    }),
});

const askQuestionSchema = z.object({
    body: z.object({
        question: z
            .string()
            .min(1, { message: "Question cannot be empty" })
            .max(1000, { message: "Question too long" }),
        topK: z
            .number()
            .int()
            .min(1)
            .max(5)
            .optional(),
    }),
});

export {
    sendMessageSchema,
    askQuestionSchema,
};

