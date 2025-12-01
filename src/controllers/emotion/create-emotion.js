import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";
import { transformEmotion } from "../../utils/transformEmotion.js";
import createEmbedding from "../../utils/embed.js";

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

        // Lấy text để tạo embedding (ưu tiên journalEntry, sau đó description)
        const textForEmbedding = journalEntry || description || "";
        
        // Tạo vector embedding từ text
        const vector = textForEmbedding ? await createEmbedding(textForEmbedding) : [];

        const emotionRecord = new Emotion({
            userId,
            emotionType: emotion || emotionType,
            moodRating: intensity ?? moodRating,
            journalEntry: description ?? journalEntry ?? "",
            tags: tags || [],
            emoji: emoji || "",
            vector: vector,
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


export { createEmotion };

