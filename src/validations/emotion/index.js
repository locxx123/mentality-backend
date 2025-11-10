const z = require("zod");

const emotionEnum = z.enum([
    'happy',
    'sad',
    'loved',
    'anxious',
    'angry',
    'tired',
    'calm',
    'confused',
], {
    message: "Invalid emotion type"
});

const emotionBody = z.object({
    emotion: emotionEnum.optional(),
    emotionType: emotionEnum.optional(),
    intensity: z.number().min(1).max(5).optional(),
    moodRating: z.number().min(1).max(5).optional(),
    description: z.string().max(2000).optional(),
    journalEntry: z.string().max(2000).optional(),
    tags: z.array(z.string()).optional(),
    emoji: z.string().optional(),
});

const createEmotionSchema = z.object({
    body: emotionBody.superRefine((data, ctx) => {
        const type = data.emotion ?? data.emotionType;
        const rating = data.intensity ?? data.moodRating;

        if (!type) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "emotion is required",
                path: ["emotion"],
            });
        }

        if (rating === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "intensity is required",
                path: ["intensity"],
            });
        }
    }),
});

const updateEmotionSchema = z.object({
    body: emotionBody.superRefine((data, ctx) => {
        const hasUpdatableField = [
            data.emotion,
            data.emotionType,
            data.intensity,
            data.moodRating,
            data.description,
            data.journalEntry,
            data.tags,
            data.emoji,
        ].some((value) => value !== undefined);

        if (!hasUpdatableField) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "At least one field is required",
            });
        }
    }),
});

module.exports = {
    createEmotionSchema,
    updateEmotionSchema,
};

