const z = require("zod");

const updateProfileSchema = z.object({
    body: z.object({
        fullName: z.string().min(2).max(100).optional(),
        age: z.number().min(1).max(150).optional(),
        gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
        occupation: z.string().max(200).optional(),
        bio: z.string().max(200).optional(),
        avatar: z.string().url().optional(),
    }),
});

module.exports = {
    updateProfileSchema,
};
