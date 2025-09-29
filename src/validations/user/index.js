const z = require("zod");

const searchSchema = z.object({
    query: z.object({
        phone: z.string().length(10, { message: "Phone number must be 10 digits" }),
        
    }),
});

module.exports = {
    searchSchema
};