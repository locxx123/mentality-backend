import ChatMessage from "../../models/ChatMessage.js";
import ChatSession from "../../models/ChatSession.js";
import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";
import { analyzeSentiment } from "../../services/ai-chat.js";
import { GoogleGenAI } from "@google/genai";
import createEmbedding from "../../utils/embed.js";

const DEFAULT_TOP_K = 5;
const PSYCHO_KEYWORDS = ["mệt", "buồn", "chán nản", "stress", "lo lắng", "tức giận", "căng thẳng"];

const cosineSimilarity = (vecA = [], vecB = []) => {
    const length = Math.min(vecA.length, vecB.length);
    if (length === 0) return 0;
    let dot = 0.0, normA = 0.0, normB = 0.0;
    for (let i = 0; i < length; i++) {
        const a = vecA[i] || 0;
        const b = vecB[i] || 0;
        dot += a * b;
        normA += a * a;
        normB += b * b;
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dot / denominator;
};

const buildContext = (entries) => {
    if (!entries.length) return "";
    return entries
        .map(
            (entry, idx) =>
                `${idx + 1}. Mood: ${entry.emotionType}, Journal: "${entry.journalEntry || "Không có mô tả"}"`
        )
        .join("\n");
};

const extractAnswerText = (response) => {
    const candidate = response?.candidates?.[0];
    if (!candidate) return "";
    if (Array.isArray(candidate.content?.parts)) {
        return candidate.content.parts.map(p => p.text || "").join("").trim();
    }
    if (Array.isArray(candidate.content)) {
        return candidate.content.map(p => p.text || "").join("").trim();
    }
    return "";
};

const buildConversationContext = (messages = []) => {
    if (!messages.length) return "";
    return messages
        .map((msg) => (msg.isFromUser ? `Người dùng: ${msg.message}` : `AI: ${msg.message}`))
        .join("\n");
};

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

        // Analyze sentiment
        const sentimentAnalysis = analyzeSentiment(message);
        console.log("Sentiment Analysis:", sentimentAnalysis);

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

        // Tạo câu trả lời AI sử dụng RAG từ ask-question.js
        // Kiểm tra xem câu hỏi có liên quan tâm lý không
        const lowerMessage = message.toLowerCase();
        const isPsychological = PSYCHO_KEYWORDS.some(word => lowerMessage.includes(word));

        // Tạo embedding cho message
        const messageEmbedding = await createEmbedding(message);
        const messageVector = Array.isArray(messageEmbedding?.values)
            ? messageEmbedding.values
            : messageEmbedding;

        if (!messageVector?.length) {
            return baseResponse(res, { success: false, statusCode: 500, msg: "EMBEDDING_FAILED" });
        }

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const userEntries = await Emotion.find({
            userId,
            date: { $gte: threeDaysAgo }
        });

        // Chỉ lấy top-k khi câu hỏi liên quan tâm lý
        const limit = isPsychological ? DEFAULT_TOP_K : 0;

        const entriesWithScore = userEntries
            .filter(e => Array.isArray(e.vector) && e.vector.length > 0)
            .map(entry => ({
                entry,
                score: cosineSimilarity(messageVector, entry.vector)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        const topEntries = entriesWithScore.map(({ entry, score }) => ({
            id: entry._id,
            emotionType: entry.emotionType,
            journalEntry: entry.journalEntry,
            moodRating: entry.moodRating,
            score
        }));

        const contextText = buildContext(topEntries);

        // Lấy lịch sử cuộc trò chuyện trong phiên hiện tại
        const conversationMessages = await ChatMessage.find({ sessionId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        const conversationContext = buildConversationContext(conversationMessages.reverse());

        // Xây prompt linh hoạt
        let prompt = "";
        let maxTokens = 150;
        const historySection = conversationContext || "Chưa có lịch sử trong phiên.";

        if (isPsychological) {
            prompt = `
Bạn là AI tư vấn tâm lý. Đây là lịch sử cuộc trò chuyện gần nhất trong phiên:
${historySection}

Dữ liệu tham khảo từ nhật ký user:
${contextText || "Không có dữ liệu cảm xúc phù hợp trong 3 ngày qua."}

Người dùng hôm nay hỏi: "${message}"

Hãy đưa ra lời khuyên tâm lý, gợi ý kỹ thuật thư giãn, với giọng đồng cảm. Trả lời bằng tiếng Việt, liên kết với lịch sử cuộc trò chuyện nếu phù hợp.
`.trim();
            maxTokens = 300; // dài hơn cho tư vấn tâm lý
        } else {
            prompt = `
Bạn là AI trợ lý thân thiện. Đây là lịch sử cuộc trò chuyện gần nhất trong phiên:
${historySection}

Hãy trả lời ngắn gọn, đúng trọng tâm câu hỏi sau và giữ sự liên kết với cuộc trò chuyện trước đó nếu phù hợp:
"${message}"
`.trim();
            maxTokens = 100; // ngắn hơn
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return baseResponse(res, { success: false, statusCode: 500, msg: "GEMINI_API_KEY_NOT_FOUND" });
        }

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            maxOutputTokens: maxTokens,
            temperature: 0.6
        });

        const aiResponse = response.text || extractAnswerText(response) || "";

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

