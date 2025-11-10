const Emotion = require("@models/Emotion");
const { baseResponse } = require("@src/config/response");

const createEmotion = async (req, res) => {
    try {
        const { emotionType, moodRating, journalEntry, tags, emoji } = req.body;
        const userId = req.user._id;

        const emotion = new Emotion({
            userId,
            emotionType,
            moodRating,
            journalEntry: journalEntry || "",
            tags: tags || [],
            emoji: emoji || "",
            date: new Date(),
        });

        await emotion.save();

        return baseResponse(res, {
            success: true,
            statusCode: 201,
            data: emotion,
            msg: "EMOTION_CREATED_SUCCESS",
        });

    } catch (error) {
        console.error("Create emotion error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { createEmotion };

