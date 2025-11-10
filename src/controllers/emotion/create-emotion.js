const Emotion = require("@models/Emotion");
const { baseResponse } = require("@src/config/response");
const { transformEmotion } = require("@src/utils/transformEmotion");

const createEmotion = async (req, res) => {
    try {
        const {
            emotion,
            emotionType,
            intensity,
            moodRating,
            description,
            journalEntry,
            tags,
            emoji,
        } = req.body;
        const userId = req.user._id;

        const emotionRecord = new Emotion({
            userId,
            emotionType: emotion || emotionType,
            moodRating: intensity ?? moodRating,
            journalEntry: description ?? journalEntry ?? "",
            tags: tags || [],
            emoji: emoji || "",
            date: new Date(),
        });

        await emotionRecord.save();

        const normalizedEmotion = transformEmotion(emotionRecord);

        return baseResponse(res, {
            success: true,
            statusCode: 201,
            data: normalizedEmotion,
            msg: "Ghi nhận cảm xúc thành công",
        });

    } catch (error) {
        console.error("Create emotion error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "Lỗi server, vui lòng thử lại sau",
        });
    }
};

module.exports = { createEmotion };

