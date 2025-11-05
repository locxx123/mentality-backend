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

const updateProfileSchema = z.object({
    body: z.object({
        fullName: z.string().min(2).optional(),
        avatar: z.string().url().optional(),
        bio: z.string().max(200).optional() // Giới hạn bio 200 ký tự
    }).refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field must be provided for update"
        }
    )
});

module.exports = {
    searchSchema,
    addFriendSchema,
    updateFriendRequestSchema,
    updateProfileSchema
};