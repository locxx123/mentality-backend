const z = require("zod");

const createEmotionSchema = z.object({
    body: z.object({
        emotionType: z.enum(['happy', 'sad', 'anxious', 'stressed', 'tired', 'angry', 'calm', 'excited', 'lonely', 'grateful'], {
            message: "Invalid emotion type"
        }),
        moodRating: z.number().min(1).max(5),
        journalEntry: z.string().max(2000).optional(),
        tags: z.array(z.string()).optional(),
        emoji: z.string().optional(),
    }),
});

const updateEmotionSchema = z.object({
    body: z.object({
        emotionType: z.enum(['happy', 'sad', 'anxious', 'stressed', 'tired', 'angry', 'calm', 'excited', 'lonely', 'grateful']).optional(),
        moodRating: z.number().min(1).max(5).optional(),
        journalEntry: z.string().max(2000).optional(),
        tags: z.array(z.string()).optional(),
        emoji: z.string().optional(),
    }),
});

module.exports = {
    createEmotionSchema,
    updateEmotionSchema,
};

