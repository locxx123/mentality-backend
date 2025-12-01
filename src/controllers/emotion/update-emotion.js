import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";
import { transformEmotion } from "../../utils/transformEmotion.js";

const updateEmotion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const {
            emotion: emotionValue,
            emotionType,
            intensity,
            moodRating,
            description,
            journalEntry,
            tags,
            emoji
        } = req.body;

        const emotionDoc = await Emotion.findOne({ _id: id, userId });

        if (!emotionDoc) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: "EMOTION_NOT_FOUND",
            });
        }

        if (emotionValue || emotionType) emotionDoc.emotionType = emotionValue || emotionType;
        if (intensity !== undefined || moodRating !== undefined) {
            emotionDoc.moodRating = intensity ?? moodRating ?? emotionDoc.moodRating;
        }
        if (description !== undefined || journalEntry !== undefined) {
            emotionDoc.journalEntry = description ?? journalEntry ?? emotionDoc.journalEntry;
        }
        if (tags !== undefined) emotionDoc.tags = tags;
        if (emoji !== undefined) emotionDoc.emoji = emoji;

        await emotionDoc.save();

        const normalizedEmotion = transformEmotion(emotionDoc);

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: normalizedEmotion,
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

export { updateEmotion };

