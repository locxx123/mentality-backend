const z = require("zod");

const sendMessageSchema = z.object({
    body: z.object({
        message: z.string().min(1, { message: "Message cannot be empty" }).max(1000, { message: "Message too long" }),
    }),
});

module.exports = {
    sendMessageSchema,
};

