const z = require("zod");

const searchSchema = z.object({
    query: z.object({
        phone: z.string().length(10, { message: "Phone number must be 10 digits" }),
        
    }),
});

const addFriendSchema = z.object({
    body: z.object({
        phone: z.string().length(10, { message: "Phone number must be 10 digits" }),
    }),
});
const updateFriendRequestSchema = z.object({
    body: z.object({
        requestId: z.string().min(1, { message: "RequestId is required" }),
        action: z.enum(["accepted", "decline"], { message: "Action must be accept or decline" }),
    }),
});

module.exports = {
    searchSchema,
    addFriendSchema,
    updateFriendRequestSchema
};