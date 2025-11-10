const Emotion = require("@models/Emotion");
const { baseResponse } = require("@src/config/response");

const updateEmotion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { emotionType, moodRating, journalEntry, tags, emoji } = req.body;

        const emotion = await Emotion.findOne({ _id: id, userId });

        if (!emotion) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: "EMOTION_NOT_FOUND",
            });
        }

        if (emotionType) emotion.emotionType = emotionType;
        if (moodRating) emotion.moodRating = moodRating;
        if (journalEntry !== undefined) emotion.journalEntry = journalEntry;
        if (tags) emotion.tags = tags;
        if (emoji !== undefined) emotion.emoji = emoji;

        await emotion.save();

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: emotion,
            msg: "EMOTION_UPDATED_SUCCESS",
        });

    } catch (error) {
        console.error("Update emotion error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { updateEmotion };

