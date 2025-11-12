import ChatMessage from "../../models/ChatMessage.js";
import ChatSession from "../../models/ChatSession.js";
import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";
import { analyzeSentiment, generateResponseWithContext } from "../../services/ai-chat.js";

const sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user._id;

        if (!message || message.trim().length === 0) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "MESSAGE_REQUIRED",
            });
        }

        if (!sessionId) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "SESSION_ID_REQUIRED",
            });
        }

        // Kiểm tra session có tồn tại và thuộc về user không
        const session = await ChatSession.findOne({ _id: sessionId, userId });
        if (!session) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: "SESSION_NOT_FOUND",
            });
        }

        // 1️⃣ Lấy dữ liệu cảm xúc gần đây của người dùng
        const emotions = await Emotion.find({ userId })
            .sort({ date: -1 })
            .limit(5);

        // 2️⃣ Tạo context từ các cảm xúc
        const context = emotions
            .map(
                (e) =>
                    `- ${e.date.toISOString().split("T")[0]}: ${e.journalEntry || "Không có mô tả"} (${e.emotionType}, mức độ: ${e.moodRating}/5)`
            )
            .join("\n");

        // Analyze sentiment
        const sentimentAnalysis = analyzeSentiment(message);
        console.log("Sentiment Analysis:", sentimentAnalysis);
        console.log("Context:", context);

        // Save user message
        const userMessage = new ChatMessage({
            userId,
            sessionId,
            message: message.trim(),
            isFromUser: true,
            sentiment: sentimentAnalysis.sentiment,
            sentimentScore: sentimentAnalysis.score,
        });
        await userMessage.save();

        // 3️⃣ Generate AI response với context
        const aiResponse = await generateResponseWithContext(message, context, sentimentAnalysis.sentiment);

        // Save AI response
        const aiMessage = new ChatMessage({
            userId,
            sessionId,
            message: aiResponse,
            isFromUser: false,
        });
        await aiMessage.save();

        // Cập nhật title của session từ message đầu tiên (nếu chưa có title tùy chỉnh)
        if (session.title === "Cuộc trò chuyện mới" && message.trim().length > 0) {
            // Lấy 50 ký tự đầu của message làm title
            session.title = message.trim().substring(0, 50);
        }

        // Cập nhật lastMessageAt
        session.lastMessageAt = new Date();
        await session.save();

        return baseResponse(res, {
            success: true,
            statusCode: 201,
            data: {
                userMessage,
                aiMessage,
                sentiment: sentimentAnalysis,
            },
            msg: "MESSAGE_SENT_SUCCESS",
        });

    } catch (error) {
        console.error("Send message error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

export { sendMessage };

